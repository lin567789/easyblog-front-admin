<template>
  <div>
    <!-- 新增修改弹窗 -->
    <Window
      :show="windowConfig.show"
      :buttons="windowConfig.buttons"
      @close="closeWindow"
      style="cursor: pointer;"
    >
      <el-form :model="blogFormData" :rules="rules" ref="blogFormRef">
        <el-form-item prop="title">
          <div class="title-input">
            <el-input
              placeholder="请输入博客标题"
              v-model="blogFormData.title"
            />
          </div>
        </el-form-item>
        <el-form-item prop="content">
          <div :style="{ width: '100%' }">
            <EditorHtml
              :height="editHtmlHeight"
              v-if="blogFormData.editorType == 0"
              v-model="blogFormData.content"
            ></EditorHtml>
            <EditorMarkdown
              :height="editMarkdownHeight"
              v-model="blogFormData.markdownContent"
              @htmlContent="setHtmlContent"
              v-else
            ></EditorMarkdown>
          </div>
        </el-form-item>
      </el-form>
    </Window>

    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      width="800px"
      @close="dialogConfig.show = false"
    >
      <el-form
        :model="blogFormData"
        :rules="rules"
        ref="settingFormRef"
        label-width="80"
        class="blog-setting-form"
      >
        <el-form-item prop="categoryId" label="博客分类">
          <el-select
            v-model="blogFormData.categoryId"
            clearable
            placeholder="请选择分类"
            :style="{ width: '100%' }"
          >
            <el-option :value="0" label="全部分类"></el-option>
            <el-option
              v-for="item in categoryList"
              :value="item.categoryId"
              :label="item.categoryName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="cover" label="封面">
          <CoverUpload v-model="blogFormData.cover"></CoverUpload>
        </el-form-item>
        <el-form-item prop="type" label="博客类型">
          <el-radio-group v-model="blogFormData.type">
            <el-radio :label="0">原创</el-radio>
            <el-radio :label="1">转载</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          prop="reprintUrl"
          label="原文地址"
          v-if="blogFormData.type == 1"
        >
          <el-input
            v-model="blogFormData.reprintUrl"
            placeholder="请输入原文地址"
          ></el-input>
          <!-- <CoverUpload v-model="blogFormData.reprintUrl"></CoverUpload> -->
        </el-form-item>
        <el-form-item prop="allowComment" label="评论">
          <div class="allow-comment">
            <el-radio-group v-model="blogFormData.allowComment">
              <el-radio :label="1">允许</el-radio>
              <el-radio :label="0">不允许</el-radio>
            </el-radio-group>
            <span class="info"
              >请现在评论设置里设置好相应参数，评论才会生效</span
            >
          </div>
        </el-form-item>
        <el-form-item prop="summary" label="博客摘要">
          <el-input
            v-model="blogFormData.summary"
            type="textarea"
            placeholder="请输入摘要"
            :autosize="{ minRows: 4, maxRows: 4 }"
          ></el-input>
        </el-form-item>
        <el-form-item prop="tag" label="博客标签">
          <div class="tag-input-panel">
            <div class="tag-list">
              <el-tag
                v-for="(item, index) in blogFormData.tag"
                @close="closeTag(index)"
                closable
                class="tag-item"
              >
                {{ item }}
              </el-tag>
            </div>

            <span class="info" v-if="blogFormData.tag.length == 0"
              >添加标签更容易被搜索引擎收录</span
            >
            <el-icon
              class="el-icon--plus"
              @click="showTagInputHandler"
              v-if="!showTagInput"
              ><Plus
            /></el-icon>
            <el-input
              class="tag-input"
              v-if="showTagInput"
              v-model="tagInputValue"
              @blur="tagInputSubmit"
              @keyup.enter="tagInputSubmit"
            ></el-input>
          </div>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import {
  getCurrentInstance,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref
} from 'vue'
import { Plus } from '@element-plus/icons-vue'
//达到了适配，页面大小和markdown大小,保持在行内有滚动条，不出现在外部
const editMarkdownHeight = window.innerHeight - 60 - 20 - 30 - 50 - 50 - 20
const editHtmlHeight = window.innerHeight - 60 - 20 - 30 - 50 - 100 - 50
const { proxy } = getCurrentInstance()
const api = {
  loadAllCategory: '/category/loadAllCategory4Blog',
  saveBlog: '/blog/saveBlog',
  getUserInfo: 'getUserInfo',
  getBlogDetail: '/blog/getBlogById',
  autoSaveBlog: 'blog/autoSaveBlog'
}

const init = (type, data) => {
  //开启自动保存
  startTimer()
  windowConfig.show = true
  nextTick(() => {
    blogFormRef.value.resetFields()
    blogFormData.value = { tag: [] }
    if (type === 'add') {
      getUserInfo()
    } else {
      getBlogDetail(data.blogId)
    }
  })
}
//在用户点击修改时获取博客详情
const getBlogDetail = async (blogId) => {
  let result = await proxy.Request({
    url: api.getBlogDetail,
    params: { blogId }
  })
  if (!result) {
    return
  }
  //由于存储的tag标签是以竖线分割，所以显示在页面时要恢复成数组

  blogFormData.value = result.data
  if (result.data.tag) {
    blogFormData.value.tag = result.data.tag.split('|')
  } else {
    blogFormData.value.tag = []
  }
}

//定义自动保存，保证用户输入的数据不丢失,只针对博客内容
let timer = ref(null)
const startTimer = () => {
  timer.value = setInterval(() => {
    autoSave()
  }, 10000)
}

const cleanTimer = () => {
  if (timer.value !== null) {
    clearInterval(timer.value)
    timer.value = null
  }
}
const autoSave = async () => {
  //如果标题和内容都为空，则不保存
  if (
    blogFormData.value.title == undefined ||
    blogFormData.value.content == undefined ||
    timer.value == null ||
    dialogConfig.show == true
  ) {
    return
  }
  const params = {}
  Object.assign(params, blogFormData.value)
  let result = await proxy.Request({
    url: api.autoSaveBlog,
    showLoading: false,
    params: params
  })
  if (!result) {
    return
  }
  blogFormData.value.blogId = result.data
}

//把方法暴漏出去
defineExpose({ init })
const getUserInfo = async () => {
  let result = await proxy.Request({
    url: api.getUserInfo
  })
  if (!result) {
    return
  }
  blogFormData.value.editorType = result.data.editorType
}
//新增修改弹窗
const windowConfig = reactive({
  show: false,
  buttons: [
    {
      type: 'danger',
      text: '确定',
      click: (e) => {
        showSettings()
      }
    }
  ]
})

const emit = defineEmits()
//关闭弹窗
const closeWindow = () => {
  windowConfig.show = false
  emit('callback')
  //如果关闭弹窗，则关闭自动保存定时器
  if (timer.value !== null) {
    cleanTimer()
  }
}
//博客分类
const categoryList = ref([])
const loadCategoryList = async () => {
  let result = await proxy.Request({
    url: api.loadAllCategory
  })
  if (!result) {
    return
  }
  categoryList.value = result.data
}
onMounted(() => {
  loadCategoryList()
})
//页面卸载
onUnmounted(() => {
  cleanTimer()
})
//博客正文
const blogFormRef = ref(null)
const blogFormData = ref({ tag: [] })

//设置markdown编辑器设置html内容
const setHtmlContent = (htmlContent) => {
  blogFormData.value.content = htmlContent
}
//第一步骤提交展示配置弹窗
const showSettings = () => {
  blogFormRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    dialogConfig.show = true
  })
}

const rules = {
  title: [{ required: true, message: '请输入标题' }],
  content: [{ required: true, message: '请输入正文' }],
  categoryId: [{ required: true, message: '请选择博客分类' }],
  type: [{ required: true, message: '请选择博客类型' }],
  allowComment: [{ required: true, message: '请选择是否允许评论' }],
  reprintUrl: [{ required: true, message: '请输入原文地址' }]
}

//博客设置
// const blogFormData = ref({ tag: [] })
//点击页面下确定按钮弹窗
const dialogConfig = reactive({
  show: false,
  title: '博客设置',
  buttons: [
    {
      type: 'danger',
      text: '确定',
      click: (e) => {
        submitBlog()
      }
    }
  ]
})

//标签输入
//删除标签
const closeTag = (index) => {
  blogFormData.value.tag.splice(index, 1)
}
//tag输入框的值
const tagInputValue = ref(null)
//显示tag输入框
const showTagInput = ref(false)
const showTagInputHandler = () => {
  showTagInput.value = true
}
//在用户输入tag标签后按enter或失去焦点时触发
const tagInputSubmit = () => {
  showTagInput.value = false
  if (tagInputValue.value == undefined) {
    return
  }
  //如果输入的值已存在，则不添加
  if (blogFormData.value.tag.indexOf(tagInputValue.value) == -1) {
    blogFormData.value.tag.push(tagInputValue.value)
  }

  tagInputValue.value = undefined
}

const settingFormRef = ref()
//当用户点击bdialog里面的确定按钮
const submitBlog = () => {
  settingFormRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }

    const params = {}
    Object.assign(params, blogFormData.value)
    params.tag = params.tag.join('|')
    let result = await proxy.Request({
      url: api.saveBlog,
      params
    })
    if (!result) {
      return
    }
    proxy.Message.success('保存博客成功')
    dialogConfig.show = false
    closeWindow()
  })
}
</script>

<style lang="scss">
.el-form-item.is-error .el-input__wrapper {
  box-shadow: none;
}
.title-input {
  border-bottom: 1px solid #ddd;
  width: 100%;
  .el-input__wrapper {
    box-shadow: none;
  }

  input {
    font-size: 18px;
  }
}
.blog-setting-form {
  .allow-comment {
    display: flex;
    .info {
      margin-left: 10px;
      color: #aba6a6;
      font-size: 13px;
    }
  }
  .tag-input-panel {
    display: flex;
    align-items: center;
    .tag-list {
      display: flex;
      .tag-item {
        margin-right: 10px;
      }
    }
    .info {
      color: #aba6a6;
      font-size: 13px;
      margin-right: 10px;
    }
    .el-icon--plus {
      color: red;
      margin-right: 10px;
      font-size: 15px;
      cursor: pointer;
    }
    .tag-input {
      width: 100px;
    }
  }
}
</style>
