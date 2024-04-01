<template>
  <div>
    <el-button type="primary" @click="showEdit('add')">新增专题</el-button>
    <el-row :gutter="10" :style="{ 'margin-top': '10px' }">
      <el-col :span="14">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>专题</span>
            </div>
          </template>
          <Table
            :columns="columns"
            :showPagination="true"
            :dataSource="tableData"
            :fetch="loadDataList"
            :options="tableOptions"
            @rowClick="rowClick"
            ref="dataTableRef"
          >
            <template #cover="{ index, row }">
              <Cover :cover="row.cover"></Cover>
            </template>
            <template #op="{ index, row }">
              <div class="op">
                <a
                  href="javascript:void(0)"
                  class="a-link"
                  @click="showEdit('update', row)"
                  v-if="userInfo.userId == row.userId"
                  >修改</a
                >
                <span v-else>--</span>
                <el-divider direction="vertical"></el-divider>
                <a
                  href="javascript:void(0)"
                  class="a-link"
                  @click="del(row)"
                  v-if="userInfo.userId == row.userId"
                  >删除</a
                >
                <span v-else>--</span>
              </div>
            </template>
          </Table>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>专题文章</span>
            </div>
          </template>
          <span></span>
          <div :style="{ 'margin-bottom': '5px' }">
            <el-alert
              title="绿色代表草稿，红色代表已发布 | 拖动文章修改排序"
              type="info"
              show-icon
              :closable="false"
            ></el-alert>
          </div>
          <div class="special-blog-tree">
            <el-tree
              class="tree-panel"
              ref="refTree"
              :data="blogList"
              defaultExpandAll
              node-key="blogId"
              :expand-on-click-node="false"
              :props="treeProps"
              :highlight-current="true"
              draggable
              @node-drop="blogDrag"
            >
              <template #default="{ node, data }">
                <span class="custom-node-style">
                  <span class="node-title">
                    <span
                      v-if="data.status == 0"
                      :style="{
                        color: 'red',
                        'font-size': '13px'
                      }"
                    >
                      {{ data.title }}
                    </span>
                    <span
                      v-else
                      :style="{
                        color: 'green',
                        'font-size': '13px'
                      }"
                      >{{ data.title }}</span
                    >
                  </span>
                  <span class="node-op">
                    <template v-if="data.blogId === '0'">
                      <a
                        class="a-link"
                        href="javascript:void(0)"
                        @click="editBlog('add', data)"
                        >新增文章</a
                      >
                    </template>
                    <template v-else>
                      <a
                        class="a-link"
                        href="javascript:void(0)"
                        @click="showDetail(data)"
                        >预览</a
                      >
                      <el-divider direction="vertical"></el-divider>
                      <a
                        class="a-link"
                        href="javascript:void(0)"
                        @click="editBlog('edit', data)"
                        v-if="userInfo.userId == data.userId"
                        >修改</a
                      >
                      <span v-else>--</span>
                      <el-divider direction="vertical"></el-divider>
                      <a
                        class="a-link"
                        href="javascript:void(0)"
                        @click="delBlog(data)"
                        v-if="userInfo.userId == data.userId"
                        >删除</a
                      >
                      <span v-else>--</span>
                      <el-divider direction="vertical"></el-divider>
                      <a
                        class="a-link"
                        href="javascript:void(0)"
                        @click="editBlog('add', data)"
                        >新增下级文章</a
                      >
                    </template>
                  </span>
                </span>
              </template>
            </el-tree>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      @close="dialogConfig.show = false"
    >
      <el-form
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        label-width="80"
      >
        <el-form-item prop="categoryName" label="名称">
          <el-input
            placeholder="请输入名称"
            v-model="formData.categoryName"
          ></el-input>
        </el-form-item>
        <el-form-item prop="cover" label="封面">
          <CoverUpload v-model="formData.cover"></CoverUpload>
        </el-form-item>
        <el-form-item prop="categoryDesc" label="简介">
          <el-input
            v-model="formData.categoryDesc"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 4 }"
            placeholder="请输入简介"
          ></el-input>
        </el-form-item>
      </el-form>
    </Dialog>
    <SpecialEdit ref="blogEditRef" @callback="saveBlogCallback"></SpecialEdit>
    <SpecialDetail ref="blogDetailRef"></SpecialDetail>
  </div>
</template>

<script setup>
import SpecialEdit from './SpecialEdit.vue'
import SpecialDetail from './SpecialDetail.vue'
import { getCurrentInstance, nextTick, reactive, ref } from 'vue'
const { proxy } = getCurrentInstance()
const api = {
  loadDataList: '/category/loadCategory4Special',
  saveCategory: '/category/saveCategory4Special',
  delCategory: '/category/delCategory4Special',
  getSpecialInfo: '/blog/getSpecialInfo',
  delBlog: '/blog/recoveryBlog',
  updateSpecialBlogSort: '/blog/updateSpecialBlogSort'
}
const userInfo = ref(proxy.VueCookies.get('userInfo') || {})
// 列表
const columns = [
  {
    label: '封面',
    prop: 'cover',
    width: 100,
    scopedSlots: 'cover'
  },
  {
    label: '名称',
    prop: 'categoryName',
    width: 200
  },
  {
    label: '简介',
    prop: 'categoryDesc'
  },
  {
    label: '博客数量',
    prop: 'blogCount',
    width: 100
  },
  {
    label: '操作',
    prop: 'op',
    width: 100,
    scopedSlots: 'op'
  }
]

const tableData = reactive({})
const tableOptions = {
  extHeight: 135
}
//当进入页面时，默认选中第一个，右侧显示专题信息
const currentCategoryId = ref(null)
const dataTableRef = ref(null)
//数据
const loadDataList = async () => {
  let result = await proxy.Request({
    url: api.loadDataList
  })
  if (!result) {
    return
  }
  Object.assign(tableData, result.data)
  if (currentCategoryId.value == null && result.data.list.length > 0) {
    currentCategoryId.value = result.data.list[0].categoryId
    loadBlogList()
  }
  nextTick(() => {
    dataTableRef.value.setCurrentRow('categoryId', currentCategoryId.value)
  })
}

//新增.修改 专题
const dialogConfig = reactive({
  show: false,
  title: '标题',
  buttons: [
    {
      type: 'danger',
      text: '确定',
      click: (e) => {
        submitForm()
      }
    }
  ]
})

const formData = ref({})
const formDataRef = ref()
const rules = {
  categoryName: [{ required: true, message: '请输入分类名称' }]
}

//新增，修改专题博客
const blogEditRef = ref(null)
const editBlog = (type, data) => {
  blogEditRef.value.init(type, data)
}
//保存专题博客回调
const saveBlogCallback = () => {
  loadBlogList()
}

const showEdit = (type, data) => {
  dialogConfig.show = true
  //清空
  nextTick(() => {
    formDataRef.value.resetFields()
    if (type == 'add') {
      dialogConfig.title = '新增分类'
      formData.value = {}
    } else if (type == 'update') {
      dialogConfig.title = '编辑分类'
      //深拷贝
      formData.value = JSON.parse(JSON.stringify(data))
    }
  })
}
//定义点击表单的确认按钮
const submitForm = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    //否则请求服务器进行上传
    let params = {}
    Object.assign(params, formData.value)
    let result = await proxy.Request({
      url: api.saveCategory,
      params
    })
    if (!result) {
      return
    }
    dialogConfig.show = false
    proxy.Message.success('保存成功')
    loadDataList()
  })
}

//预览详情
const blogDetailRef = ref(null)
const showDetail = (data) => {
  blogDetailRef.value.showDetail(data)
}
//删除博客
const delBlog = (data) => {
  proxy.Confirm(`你确定要删除【${data.title}】吗？`, async () => {
    let result = await proxy.Request({
      url: api.delBlog,
      params: {
        blogId: data.blogId
      }
    })
    if (!result) {
      return
    }
    proxy.Message.success('删除博客成功')
    loadBlogList()
  })
}
//删除
const del = (data) => {
  proxy.Confirm(`你确定要删除${data.categoryName}吗？`, async () => {
    let result = await proxy.Request({
      url: api.delCategory,
      params: {
        categoryId: data.categoryId
      }
    })
    if (!result) {
      return
    }
    proxy.Message.success('删除成功')
    loadDataList()
    currentCategoryId.value = null
  })
}

//专题树
const blogList = ref([])
//行点击事件
const rowClick = (row) => {
  currentCategoryId.value = row.categoryId
  loadBlogList()
}
//获取专题文章
const loadBlogList = async () => {
  let result = await proxy.Request({
    url: api.getSpecialInfo,
    params: {
      categoryId: currentCategoryId.value,
      showType: '1'
    }
  })
  if (!result) {
    return
  }
  blogList.value = result.data
}
//属性展示专题
const treeProps = {
  children: 'children',
  label: 'title',
  value: 'blogId'
}

//拖动改变排序，修改父级
const blogDrag = async (draggingNode, dropNode, dropType, ev) => {
  //拖入某个节点内，修改父级节点为目标节点，同时修改目标节点下的所有子节点的排序
  //draggingNode是被拖拽节点对应得node，dropNode是结束拖拽时最后进入的节点，
  //dropType被拖拽节点得放置位置，
  let parentNode = null
  if (dropType == 'inner') {
    parentNode = dropNode
  } else {
    //拖入之前，之后，修改被拖动节点的父节点为目标节点的父节点，同时修改目标节点父节点下所有子节点的排序
    parentNode = dropNode.parent
  }
  //操作的节点ID
  const blogId = draggingNode.data.blogId
  const pBlogId = parentNode.data.blogId
  //需要重新排序的博客Id
  const blogIds = []
  parentNode.childNodes.forEach((element) => {
    blogIds.push(element.data.blogId)
  })
  const params = {
    blogId,
    pBlogId,
    blogIds: blogIds.join(',')
  }
  let result = await proxy.Request({
    url: api.updateSpecialBlogSort,
    params
  })
  if (!result) {
    return
  }
  //重新加载文章树
  loadBlogList()
}
</script>

<style lang="scss" scoped>
.tree-panel {
  height: calc(100vh - 290px);
  overflow: auto;
  .custom-node-style {
    flex: 1;
    display: flex;
    justify-content: space-between;
  }
}
</style>
