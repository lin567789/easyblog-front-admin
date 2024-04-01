<template>
  <div>
    <el-form :model="searchFormData">
      <el-row>
        <el-col :span="5">
          <el-form-item prop="nickName" label="昵称" label-width="50px">
            <el-input
              placeholder="请输入昵称"
              v-model="searchFormData.nickNameFuzzy"
              clearable
              @keyup.enter="loadDataList"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item prop="phone" label="手机号" label-width="80px">
            <el-input
              placeholder="请输入手机号"
              v-model="searchFormData.phoneFuzzy"
              clearable
              @keyup.enter="loadDataList"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="5" class="btn" :style="{ 'margin-left': '10px' }">
          <el-button type="danger" @click="loadDataList">搜索</el-button>
          <el-button
            type="danger"
            @click="showEdit('add')"
            v-if="userInfo.roleType == 1"
            >新增成员</el-button
          >
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
      <!-- 头像 -->
      <template #avatar="{ index, row }">
        <Cover :cover="row.avatar"></Cover>
      </template>
      <!-- 用户信息 -->
      <template #userInfo="{ index, row }">
        <div>昵&nbsp;&nbsp;&nbsp;&nbsp;称：{{ row.nickName }}</div>
        <div>手机号：{{ row.phone }}</div>
        <div>职&nbsp;&nbsp;&nbsp;&nbsp;业：{{ row.profession }}</div>
      </template>
      <!-- 角色 -->
      <template #roleInfo="{ index, row }">
        <div>{{ row.roleTypeName }}</div>
      </template>
      <!-- 状态信息 -->
      <template #statusInfo="{ index, row }">
        <div>
          <span :style="{ color: row.status == 1 ? 'green' : 'red' }">
            {{ row.statusName }}</span
          >
        </div>
      </template>
      <!-- 时间 -->
      <template #timeInfo="{ index, row }">
        <div>创建时间：{{ row.createTime }}</div>
        <div>最后登录时间：{{ row.lastUpdateTime }}</div>
      </template>
      <!-- 操作 -->
      <template #operation="{ index, row }">
        <span v-if="userInfo.roleType == 1">
          <div class="op">
            <a
              href="javascript:void(0)"
              class="a-link"
              @click="showEdit('update', row)"
              >修改</a
            >
            <el-divider direction="vertical"></el-divider>
            <a
              href="javascript:void(0)"
              class="a-link"
              @click="changAccountStatus(row)"
              >{{ row.status == 0 ? '启用' : '禁用' }}</a
            >
            <el-divider direction="vertical"></el-divider>
            <a
              href="javascript:void(0)"
              class="a-link"
              @click="showUpdatePassword(row.userId)"
              >修改密码</a
            >
            <el-divider direction="vertical"></el-divider>
            <a href="javascript:void(0)" class="a-link" @click="delUser(row)"
              >删除</a
            >
          </div>
        </span>
        <span v-else> ----</span>
      </template>
    </Table>
    <!-- 新增成员弹窗 -->
    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      @close="dialogConfig.show = false"
      width="840px"
    >
      <el-form
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        label-width="80"
      >
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item prop="nickName" label="昵称">
              <el-input
                placeholder="请输入昵称"
                v-model="formData.nickName"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="phone" label="手机号">
              <el-input
                placeholder="请输入手机号"
                v-model="formData.phone"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10" v-if="dialogConfig.title == '新增账号'">
          <el-col :span="12">
            <el-form-item prop="password" label="密码">
              <el-input
                type="password"
                placeholder="请输入密码"
                v-model="formData.password"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="rePassword" label="重复密码">
              <el-input
                placeholder="请再次输入密码"
                v-model="formData.rePassword"
                type="password"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item
              prop="editorType"
              label="默认编辑器"
              label-width="100"
            >
              <el-radio-group v-model="formData.editorType">
                <el-radio :label="0">富文本编辑框</el-radio>
                <el-radio :label="1">Markdown编辑器</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="profession" label="职业">
              <el-input
                placeholder="请输入职业"
                v-model="formData.profession"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="24">
            <el-form-item prop="avatar" label="头像">
              <CoverUpload v-model="formData.avatar"></CoverUpload>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="24">
            <el-form-item prop="introduction" label="简介">
              <editor-html
                id="introduction"
                ref="introduction"
                :height="250"
                v-model="formData.introduction"
              ></editor-html>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </Dialog>
    <!-- //修改密码弹窗 -->
    <Dialog
      :show="editPasstDialog.show"
      :title="editPasstDialog.title"
      :buttons="editPasstDialog.buttons"
      width="500px"
      @close="editPasstDialog.show = false"
    >
      <el-form
        :model="formData"
        :rules="rules"
        ref="passwordFormDataRef"
        label-width="80"
      >
        <el-form-item prop="password" label="密码">
          <el-input
            type="password"
            placeholder="请输入密码"
            v-model="formData.password"
          ></el-input>
        </el-form-item>
        <el-form-item prop="rePassword" label="重复密码">
          <el-input
            placeholder="请再次输入密码"
            v-model="formData.rePassword"
          ></el-input>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import { getCurrentInstance, reactive, ref, nextTick } from 'vue'
const searchFormData = reactive({})
const { proxy } = getCurrentInstance()
const api = {
  loadDataList: '/setting/loadUser',
  saveTeamUser: '/setting/saveTeamUser',
  updateStatus: '/setting/updateStatus',
  delUser: '/setting/delUser',
  updatePassword: '/setting/updatePassword'
}
const userInfo = ref(proxy.VueCookies.get('userInfo') || {})
// const userInfo = ref({ roleType: 1 })
// 列表
const columns = [
  {
    label: '头像',
    prop: 'avatar',
    width: 80,
    scopedSlots: 'avatar'
  },
  {
    label: '用户信息',
    prop: 'nickName',
    scopedSlots: 'userInfo',
    width: 250
  },
  {
    label: '默认编辑器',
    prop: 'editorTypeName',
    width: 150
  },
  {
    label: '角色',
    prop: 'roleTypeName',
    scopedSlots: 'roleInfo',
    width: 140
  },
  {
    label: '状态',
    prop: 'statusInfo',
    width: 140,
    scopedSlots: 'statusInfo'
  },
  {
    label: '时间',
    prop: 'createTime',
    width: 250,
    scopedSlots: 'timeInfo'
  },
  {
    label: '操作',
    prop: 'operation',
    width: 250,
    scopedSlots: 'operation'
  }
]
//校验规则
//重复密码的校验
const validateRePass = (rule, value, callback) => {
  if (value !== formData.value.password) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}
const rules = {
  nickName: [{ required: true, message: '昵称不能为空' }],
  editorType: [{ required: true, message: '请选择默认编辑器' }],
  password: [
    { required: true, message: '请输入密码' },
    {
      validator: proxy.Verify.password,
      message: '密码最少8为,只能数字字母和特殊字符'
    }
  ],
  rePassword: [
    { required: true, message: '请再次输入密码' },
    {
      validator: validateRePass,
      message: '两次输入的密码不一致'
    }
  ],
  phone: [
    { required: true, message: '请输入手机号' },
    {
      validator: proxy.Verify.phone,
      trigger: 'blur',
      message: '请输入正确的手机号'
    }
  ]
}
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

//新增用户
//新增.修改
const dialogConfig = reactive({
  show: false,
  title: '新增用户',
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
const showEdit = (type, data) => {
  dialogConfig.show = true
  //清空
  nextTick(async () => {
    formDataRef.value.resetFields()
    if (type == 'add') {
      dialogConfig.title = '新增账号'
      formData.value = { introduction: '' }
    } else if (type == 'update') {
      dialogConfig.title = '修改账号'
      Object.assign(formData.value, data)
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
    delete params.createTime
    delete params.lastUpdateTime
    let result = await proxy.Request({
      url: api.saveTeamUser,
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

//修改密码弹窗配置
const editPasstDialog = reactive({
  show: false,
  title: '修改密码',
  buttons: [
    {
      type: 'danger',
      text: '确定',
      click: (e) => {
        submitPass()
      }
    }
  ]
})

const passwordFormDataRef = ref(null)
//显示修改密码弹窗
const showUpdatePassword = (userId) => {
  editPasstDialog.show = true
  nextTick(() => {
    passwordFormDataRef.value.resetFields()
    formData.value = { userId: userId }
  })
}
//确定修改密码
const submitPass = () => {
  passwordFormDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let result = await proxy.Request({
      url: api.updatePassword,
      params: {
        userId: formData.value.userId,
        password: formData.value.password
      }
    })
    if (!result) {
      return
    }
    editPasstDialog.show = false
    proxy.Message.success('修改密码成功')
  })
}

//修改状态
const changAccountStatus = (data) => {
  //如果本身是启用则改为禁用
  let status = data.status == 0 ? 1 : 0
  let statusName = data.status == 0 ? '启用' : '禁用'
  proxy.Confirm(`你确定要【${statusName}】${data.nickName}吗？`, async () => {
    let result = await proxy.Request({
      url: api.updateStatus,
      params: {
        userId: data.userId,
        status: status
      }
    })
    if (!result) {
      return
    }
    proxy.Message.success('修改状态成功')
    loadDataList()
  })
}
//删除成员
const delUser = (data) => {
  proxy.Confirm(`你确定要删除【${data.nickName}】吗？`, async () => {
    let result = await proxy.Request({
      url: api.delUser,
      params: {
        userId: data.userId
      }
    })
    if (!result) {
      return
    }
    proxy.Message.success('删除用户成功')
    loadDataList()
  })
}
</script>

<style lang="scss" scoped></style>
