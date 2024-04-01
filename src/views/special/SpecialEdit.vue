<template>
  <div>
    <!-- 新增修改弹窗 -->
    <Window
      :show="windowConfig.show"
      :buttons="windowConfig.buttons"
      @close="closeWindow"
    >
      <el-form :model="blogFormData" :rules="rules" ref="blogFormRef">
        <el-form-item prop="title">
          <div class="title-input">
            <el-input
              placeholder="请输入博客标题"
              v-model="blogFormData.title"
            ></el-input>
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
  saveBlog: '/blog/saveBlog4Special',
  getUserInfo: 'getUserInfo',
  getBlogDetail: '/blog/getBlogById',
  autoSaveBlog: 'blog/autoSaveBlog4Special'
}

const init = (type, data) => {
  //开启自动保存
  startTimer()
  windowConfig.show = true
  nextTick(() => {
    blogFormRef.value.resetFields()
    blogFormData.value = { categoryId: data.categoryId, pBlogId: data.blogId }
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
    timer.value == null
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
        submitBlog()
      }
    }
  ]
})

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
//第一步骤提交文章
const submitBlog = () => {
  blogFormRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let params = Object.assign({}, blogFormData.value)
    let result = await proxy.Request({
      url: api.saveBlog,
      params: params
    })
    if (!result) {
      return
    }
    proxy.Message.success('保存文章成功')
    closeWindow()
  })
}

const emit = defineEmits()
// 关闭弹窗
const closeWindow = () => {
  windowConfig.show = false
  emit('callback')
  //如果关闭弹窗，则关闭自动保存定时器
  if (timer.value !== null) {
    cleanTimer()
  }
}
const rules = {
  title: [{ required: true, message: '请输入标题' }],
  content: [{ required: true, message: '请输入正文' }],
  categoryId: [{ required: true, message: '请选择博客分类' }],
  type: [{ required: true, message: '请选择博客类型' }],
  allowComment: [{ required: true, message: '请选择是否允许评论' }],
  reprintUrl: [{ required: true, message: '请输入原文地址' }]
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
</style>
