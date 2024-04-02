<template>
  <div class="login-content">
    <div class="login-panel">
      <div class="login-title">用户登录</div>
      <el-form :model="formData" :rules="rules" ref="formDataRef">
        <el-form-item prop="account">
          <el-input
            placeholder="请输入账号"
            v-model="formData.account"
            size="large"
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            placeholder="请输入密码"
            v-model="formData.password"
            size="large"
          >
            <template #prefix>
              <span class="iconfont icon-password1"></span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="checkCode">
          <div class="check-code-panel">
            <el-input
              class="input-panel"
              placeholder="请输入验证码"
              v-model="formData.checkCode"
              size="large"
              @keyup.enter.native="login"
            ></el-input>
            <img
              :src="checkCodeUrl"
              class="check-code"
              @click="changeCheckCode"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="formData.rememberMe" :label="true"
            >记住我</el-checkbox
          >
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="loginBtn" @click="login"
            >登录</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
// 密码是admin123
import { getCurrentInstance, reactive, ref } from 'vue'
import md5 from 'js-md5'
import { useRouter } from 'vue-router'
const { proxy } = getCurrentInstance()
const router = useRouter()
const api = {
  checkCode: 'api/checkCode',
  login: 'login'
}

//保证得到的验证码不1
//首先首次直接请求接口，当需要修改验证码时，在验证码的后面加+new Date可实现刷新
//验证码功能，为什么加new Date，因为浏览器中存在缓存，缓存是先看请求地址一样不一样，一样
//的话就从缓存中取，每次请求地址不一致，也就保证了不从缓存中取.
const checkCodeUrl = ref(api.checkCode)
const changeCheckCode = () => {
  checkCodeUrl.value = 'api/checkCode' + '?' + new Date().getTime()
}

const formData = reactive({})
const formDataRef = ref({})
const rules = {
  account: [{ required: true, message: '请输入账号' }],
  password: [{ required: true, message: '请输入密码' }],
  checkCode: [{ required: true, message: '请输入验证码' }]
}

//为记住我定义一个方法，使回显到表单上
const init = () => {
  const loginInfo = proxy.VueCookies.get('loginInfo')
  if (!loginInfo) {
    return
  }
  Object.assign(formData, loginInfo)
  // 定义keydown事件
}
init()

const login = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    //获取登录信息
    let cookieLoginInfo = proxy.VueCookies.get('loginInfo')
    //获取cookie种的密码
    let cookiePassword =
      cookieLoginInfo == null ? null : cookieLoginInfo.password
    //如果输入框密码和cookie种密码不一致，
    if (formData.password !== cookiePassword) {
      formData.password = md5(formData.password)
    }
    let params = {
      account: formData.account,
      password: formData.password,
      checkCode: formData.checkCode
    }
    let result = await proxy.Request({
      url: api.login,
      params: params,
      errorCallback: () => {
        changeCheckCode()
      }
    })
    if (!result) {
      return
    }

    proxy.Message.success('登录成功')
    setTimeout(() => {
      router.push('/')
    }, 2000)

    const loginInfo = {
      account: params.account,
      password: params.password,
      rememberMe: formData.rememberMe
    }
    //永不过期
    proxy.VueCookies.set('userInfo', result.data, 0)
    //登录成功,把用户的账号密码进行保存7天
    if (formData.rememberMe) {
      proxy.VueCookies.set('loginInfo', loginInfo, '7d')
    }
  })
}
</script>

<style lang="scss">
.login-content {
  width: 100%;
  height: calc(100vh);
  background-size: cover;
  background-position: center;
  background-image: url(../assets/login-bg.jpg);
  .login-panel {
    width: 350px;
    background: #f0efef;
    float: right;
    margin-right: 100px;
    margin-top: 160px;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 2px 2px 10px #888888;
    .login-title {
      font-size: 20px;
      text-align: center;
      margin-bottom: 10px;
    }
    .loginBtn {
      width: 100%;
    }
    .check-code-panel {
      width: 100%;
      display: flex;
      align-items: center;
      .input-panel {
        flex: 1;
        margin-right: 5px;
      }
      .check-code {
        cursor: pointer;
      }
    }
  }
}
</style>
