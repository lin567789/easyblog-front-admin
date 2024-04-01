<template>
  <div>
    <div class="top-panel">
      <el-form :model="searchFormData" label-width="50px">
        <el-row>
          <el-col :span="5">
            <el-form-item prop="titleFuzzy" label="标题">
              <el-input
                placeholder="请输入标题"
                v-model="searchFormData.titleFuzzy"
                clearable
                @keyup.enter="loadDataList"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item prop="status" label="状态">
              <el-select
                v-model="searchFormData.status"
                clearable
                placeholder="请选择状态"
                :style="{ width: '100%' }"
              >
                <el-option :value="0" label="草稿"></el-option>
                <el-option :value="1" label="已发布"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item prop="categoryId" label="分类">
              <el-select
                v-model="searchFormData.categoryId"
                clearable
                placeholder="请选择分类"
                :style="{ width: '100%' }"
              >
                <el-option
                  v-for="item in categoryList"
                  :value="item.categoryId"
                  :label="item.categoryName"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5" class="btn">
            <el-button type="danger" @click="loadDataList">搜索</el-button>
            <el-button type="danger" @click="showEdit('add')"
              >新增博客</el-button
            >
          </el-col>
        </el-row>
      </el-form>
    </div>
    <Table
      :columns="columns"
      :showPagination="true"
      :dataSource="tableData"
      :fetch="loadDataList"
      :options="tableOptions"
    >
      <!-- 封面 -->
      <template #cover="{ index, row }">
        <Cover :cover="row.cover"></Cover>
      </template>
      <!-- 文章信息 -->
      <template #blogInfo="{ index, row }">
        <div>标题：{{ row.title }}</div>
        <div>分类：{{ row.categoryName }}</div>
        <div>作者：{{ row.nickName }}</div>
      </template>
      <!-- 类型 -->
      <template #typeName="{ index, row }">
        <div>
          类型：
          <span v-if="row.type == 0">原创</span>
          <span v-if="row.type == 1">转载</span>
        </div>
        <div v-if="row.type == 1">转载地址：{{ row.reprintUrl }}</div>
      </template>
      <!-- 状态 -->
      <template #statusName="{ index, row }">
        <span v-if="row.status == 1" :style="{ color: 'green' }">
          {{ row.statusName }}</span
        >
        <span v-else :style="{ color: 'red' }"> {{ row.statusName }}</span>
      </template>
      <!-- 时间 -->
      <template #time="{ index, row }">
        <div>创建时间：{{ row.createTime }}</div>
        <div>更新时间：{{ row.lastUpdateTime }}</div>
      </template>
      <!-- 操作 -->
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
            @click="delBlog(row)"
            v-if="userInfo.userId == row.userId"
            >删除</a
          >
          <span v-else>--</span>
          <el-divider direction="vertical"></el-divider>
          <a
            href="javascript:void(0)"
            class="a-link"
            @click="showDetail(row.blogId)"
            >预览</a
          >
        </div>
      </template>
    </Table>
    <!-- 新增修改弹窗 抽成一个组件-->
    <BlogEdit ref="blogEditRef" @callback="loadDataList"></BlogEdit>
    <BlogDetail ref="blogDetailRef"></BlogDetail>
  </div>
</template>

<script setup>
import { getCurrentInstance, reactive, ref } from 'vue'
import BlogEdit from './BlogEdit.vue'
import BlogDetail from './BlogDetail.vue'
const { proxy } = getCurrentInstance()
const api = {
  //获取博客分类
  loadCategory: '/category/loadAllCategory4Blog',
  loadDataList: '/blog/loadBlog',
  delBlog: '/blog/recoveryBlog',
  updateSpecialBlogSort: 'blog/updateSpecialBlogSort'
}

const userInfo = ref(proxy.VueCookies.get('userInfo') || {})
//搜索
const searchFormData = reactive({})
const categoryList = ref([])
const loadCategoryList = async () => {
  let result = await proxy.Request({
    url: api.loadCategory
  })
  categoryList.value = result.data
}
loadCategoryList()

// 列表
const columns = [
  {
    label: '封面',
    prop: 'cover',
    width: 80,
    scopedSlots: 'cover'
  },
  {
    label: '文章信息',
    prop: 'blogInfo',
    width: 280,
    scopedSlots: 'blogInfo'
  },
  {
    label: '编辑器',
    prop: 'editorTypeName',
    width: 130
  },
  {
    label: '类型',
    prop: 'typeName',
    width: 150,
    scopedSlots: 'typeName'
  },
  {
    label: '评论',
    prop: 'allowCommentTypeName',
    width: 100
  },
  {
    label: '状态',
    prop: 'statusName',
    width: 100,
    scopedSlots: 'statusName'
  },
  {
    label: '时间',
    prop: 'time',
    width: 250,
    scopedSlots: 'time'
  },
  {
    label: '操作',
    prop: 'op',
    width: 150,
    scopedSlots: 'op'
  }
]

const tableData = ref({})
const tableOptions = {
  extHeight: 50
}
//数据
const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize
  }
  Object.assign(params, searchFormData)
  let result = await proxy.Request({
    url: api.loadDataList,
    params
  })
  if (!result) {
    return
  }
  tableData.value = result.data
}

const blogEditRef = ref(null)
const showEdit = (type, data) => {
  blogEditRef.value.init(type, data)
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
    loadDataList()
  })
}

//详情
const blogDetailRef = ref(null)
const showDetail = (blogId) => {
  blogDetailRef.value.showDetail(blogId)
}
</script>

<style lang="scss">
.btn {
  display: flex;
  justify-content: center;
}
</style>
