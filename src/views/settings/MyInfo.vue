<template>
  <div>
    <el-form
      :model="formData"
      :rules="rules"
      ref="formDataRef"
      label-width="100"
    >
      <el-row :gutter="10">
        <el-col :span="9">
          <el-form-item prop="avatar" label="头像">
            <CoverUpload
              v-model="formData.avatar"
              @callback="saveAvatar"
            ></CoverUpload>
          </el-form-item>
          <el-form-item prop="nickName" label="昵称">
            <el-input
              v-model="formData.nickName"
              placeholder="请输入昵称"
            ></el-input>
          </el-form-item>
          <el-form-item prop="phone" label="手机号">
            <el-input
              v-model="formData.phone"
              placeholder="请输入手机号"
            ></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <a
              href="javascript:void(0)"
              class="a-link"
              @click="showUpdatePassword"
              >修改密码</a
            >
          </el-form-item>
          <el-form-item prop="editorType" label="默认编辑器">
            <el-radio-group v-model="formData.editorType">
              <el-radio :label="0">富文本编辑框</el-radio>
              <el-radio :label="1">Markdown编辑器</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item prop="profession" label="职业">
            <el-input
              v-model="formData.profession"
              placeholder="请输入职业"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveMyInfo">保存</el-button>
          </el-form-item>
        </el-col>
        <el-col :span="15">
          <el-form-item label="简介" prop="introduction">
            <EditorHtml v-model="formData.introduction"></EditorHtml>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      width="500px"
      @close="dialogConfig.show = false"
    >
      <el-form
        :model="passwordFormData"
        :rules="rules"
        ref="passwordFormDataRef"
        label-width="80"
      >
        <el-form-item prop="password" label="密码">
          <el-input
            type="password"
            placeholder="请输入密码"
            v-model="passwordFormData.password"
          ></el-input>
        </el-form-item>
        <el-form-item prop="rePassword" label="重复密码">
          <el-input
            placeholder="请再次输入密码"
            v-model="passwordFormData.rePassword"
          ></el-input>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref, reactive, nextTick } from 'vue'
import { useStore } from 'vuex'
const store = useStore()
const { proxy } = getCurrentInstance()
const formData = ref({})
const formDataRef = ref(null)

//重复密码的校验
const validateRePass = (rule, value, callback) => {
  if (value !== passwordFormData.value.password) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}
//校验规则
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
const api = {
  getUserInfo: 'getUserInfo',
  saveMyInfo: 'saveMyInfo',
  updateMyPassword: 'updateMyPassword',
  saveAvatar: 'saveAvatar'
}

//修改密码弹窗配置
const dialogConfig = reactive({
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

const passwordFormData = ref({})
const passwordFormDataRef = ref(null)
//显示修改密码弹窗
const showUpdatePassword = () => {
  dialogConfig.show = true
  nextTick(() => {
    passwordFormDataRef.value.resetFields()
    passwordFormData.value = {}
  })
}
//确定修改密码
const submitPass = () => {
  passwordFormDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let result = await proxy.Request({
      url: api.updateMyPassword,
      params: { password: passwordFormData.value.password }
    })
    if (!result) {
      return
    }
    dialogConfig.show = false
    proxy.Message.success('修改密码成功')
  })
}

//修改头像
const saveAvatar = async (avatar) => {
  let result = await proxy.Request({
    url: api.saveAvatar,
    params: { avatar: avatar }
  })
  if (!result) {
    return
  }
  proxy.Message.success('修改头像成功')
  store.commit('updateUserInfo', {
    nickName: formData.value.nickName,
    avatar: formData.value.avatar
  })
}
//获取用户信息
const getUserInfo = async () => {
  let result = await proxy.Request({
    url: api.getUserInfo
  })
  if (!result) {
    return
  }
  formData.value = result.data
}
getUserInfo()

//用户修改信息后点击保存触发
const saveMyInfo = async () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let result = await proxy.Request({
      url: api.saveMyInfo,
      params: {
        avatar: formData.value.avatar,
        nickName: formData.value.nickName,
        phone: formData.value.phone,
        editorType: formData.value.editorType,
        profession: formData.value.profession,
        introduction: formData.value.introduction
      }
    })
    if (!result) {
      return
    }
    proxy.Message.success('保存信息成功')
    store.commit('updateUserInfo', {
      nickName: formData.value.nickName,
      avatar: formData.value.avatar
    })
  })
}
</script>

<style lang="scss" scoped></style>
