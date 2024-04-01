<template>
  <div>
    <el-form :model="searchFormData" @submit.prevent label-width="80px">
      <el-row :gutter="10">
        <el-col :span="7">
          <el-form-item prop="titleFuzzy" label="标题">
            <el-input
              placeholder="支持模糊搜索"
              v-model="searchFormData.titleFuzzy"
              clearable
              @keyup.enter="loadDataList"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <div>
            <el-button type="danger" @click="loadDataList">搜索</el-button>
          </div>
        </el-col>
      </el-row>
    </el-form>
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
        <div>
          文章类型：{{ row.blogType == 0 ? '博客' : '专题' }}
          <el-divider direction="vertical"> </el-divider>
          <span>{{ row.blogType == 0 ? '分类' : '专题' }}</span
          >：
          {{ row.categoryName || '--' }}
        </div>
        <div>作者：{{ row.nickName }}</div>
      </template>
      <!-- 状态 -->
      <template #statusName="{ index, row }">
        <span v-if="row.status == 1" :style="{ color: 'green' }">
          {{ row.statusName }}</span
        >
        <span v-else :style="{ color: 'red' }"> {{ row.statusName }}</span>
      </template>
      <!-- 编辑器 -->
      <!-- 时间 -->
      <template #time="{ index, row }">
        <div>创建时间：{{ row.createTime }}</div>
        <div>更新时间：{{ row.lastUpdateTime }}</div>
      </template>
      <!-- 操作 -->
      <template #op="{ index, row }">
        <template
          v-if="row.userId == userInfo.userId || userInfo.roleType == 1"
        >
          <a
            href="javascript:void(0)"
            class="a-link"
            @click="reductionBlog(row)"
            v-if="userInfo.userId == row.userId"
            >还原</a
          >
          <span v-else>--</span>
          <el-divider direction="vertical"></el-divider>
          <a
            href="javascript:void(0)"
            class="a-link"
            @click="delBlog(row)"
            v-if="userInfo.userId == row.userId"
            >彻底删除</a
          >
          <span v-else>--</span>
        </template>
        <span v-else>---</span>
      </template>
    </Table>
  </div>
</template>

<script setup>
import { getCurrentInstance, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const { proxy } = getCurrentInstance()
const api = {
  loadRecoveryList: '/blog/loadRecoveryList',
  delBlog: '/blog/delBlog',
  reductionBlog: '/blog/reductionBlog'
}
const searchFormData = ref({})
const tableData = ref({})
// const userInfo = reactive({ roleType: 1 })
const tableOptions = {
  extHeight: 50
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
    label: '文章信息',
    prop: 'blogInfo',
    width: 360,
    scopedSlots: 'blogInfo'
  },
  {
    label: '状态',
    prop: 'statusName',
    width: 180,
    scopedSlots: 'statusName'
  },
  {
    label: '编辑器',
    prop: 'editorTypeName',
    width: 180
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
//数据
const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize
  }
  Object.assign(params, searchFormData)
  let result = await proxy.Request({
    url: api.loadRecoveryList,
    params
  })
  if (!result) {
    return
  }
  tableData.value = result.data
}

//彻底删除
const delBlog = (data) => {
  proxy.Confirm(
    `你确定要删除【${data.title}】吗,删除后无法找回？`,
    async () => {
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
    }
  )
}
//还原
const reductionBlog = (data) => {
  proxy.Confirm(`你确定要还原【${data.title}】吗？`, async () => {
    let result = await proxy.Request({
      url: api.reductionBlog,
      params: {
        blogId: data.blogId
      }
    })
    if (!result) {
      return
    }
    proxy.Message.success('还原成功')
    loadDataList()
  })
}
</script>

<style lang="scss" scoped></style>
