<template>
  <div>
    <el-button
      type="primary"
      @click="showEdit('add')"
      v-if="userInfo.roleType == 1"
      >新增分类</el-button
    >
    <Table
      :columns="columns"
      :showPagination="false"
      :dataSource="tableData"
      :fetch="loadDataList"
      :options="tableOptions"
    >
      <template #cover="{ index, row }">
        <Cover :cover="row.cover"></Cover>
      </template>
      <template #op="{ index, row }" v-if="userInfo.roleType == 1">
        <div class="op">
          <a
            href="javascript:void(0)"
            class="a-link"
            @click="showEdit('update', row)"
            >修改</a
          >
          <el-divider direction="vertical"></el-divider>
          <a href="javascript:void(0)" class="a-link" @click="del(row)">删除</a>
          <el-divider direction="vertical"></el-divider>
          <a
            href="javascript:void(0)"
            :class="[index == 0 ? 'not-allow' : 'a-link']"
            @click="changeSort(index, 'up')"
            >上移</a
          >
          <el-divider direction="vertical"></el-divider>
          <a
            href="javascript:void(0)"
            :class="[
              index == tableData.list.length - 1 ? 'not-allow' : 'a-link'
            ]"
            @click="changeSort(index, 'down')"
            >下移</a
          >
        </div>
      </template>
    </Table>
    <!-- 由于传递的值不是变量，所以不需要加： -->
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
  </div>
</template>

<script setup>
import { getCurrentInstance, nextTick, reactive, ref } from 'vue'
const { proxy } = getCurrentInstance()
const api = {
  loadDataList: '/category/loadAllCategory4Blog',
  saveCategory: '/category/saveCategory4Blog',
  delCategory: '/category/delCategory4Blog',
  changeCategorySort: '/category/changeCategorySort4Blog'
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
    width: 200,
    scopedSlots: 'op'
  }
]

const tableData = reactive({})
const tableOptions = {
  extHeight: 10
}
//数据
const loadDataList = async () => {
  let result = await proxy.Request({
    url: api.loadDataList
  })
  if (!result) {
    return
  }
  tableData.list = result.data
}

//新增.修改
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
      Object.assign(formData, data)
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
  })
}

//修改排序 上下移
const changeSort = async (index, type) => {
  let categoryList = tableData.list
  if (
    (type == 'down' && index === categoryList.length - 1) ||
    (type == 'up' && index === 0)
  ) {
    return
  }
  //当前值
  let temp = categoryList[index]
  let number = type == 'down' ? 1 : -1

  //删掉当前的值
  categoryList.splice(index, 1)
  //需要理解
  categoryList.splice(index + number, 0, temp)
  console.log(JSON.stringify(categoryList))

  let result = await proxy.Request({
    url: api.changeCategorySort,
    dataType: 'json',
    params: categoryList
  })
  if (!result) {
    return
  }
  proxy.Message.success('重新排序成功')
  loadDataList()
}
</script>

<style lang="scss" scoped>

</style>
