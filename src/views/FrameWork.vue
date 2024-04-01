<template>
  <div class="layout">
    <el-container>
      <el-header class="header">
        <img src="../assets/blog.png"  style="cursor: pointer;" @click="()=>{router.push('/')}" />
        <div class="userinfo">
          <span>欢迎回来， </span>
          <el-dropdown>
            <span class="nick-name">
              {{ userInfo.nickName }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :icon="Plus">
                  <router-link to="../settings/my" class="a-link">个人信息</router-link>
                </el-dropdown-item>
                <el-dropdown-item :icon="CirclePlusFilled" @click="logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <div class="avatar">
            <img :src="userInfo.avatar" style="cursor: pointer;" @click="()=>{router.push('/settings/my')}"/>
          </div>
        </div>
      </el-header>
      <el-container class="contaniner">
        <el-aside width="200px" class="left-aside">
          <el-button class="post-Btn" @click="createHtml">发布</el-button>
          <el-row class="tac">
            <el-col :span="24">
              <el-menu :default-active="activePath" class="el-menu-vertical-demo" @open="handleOpen"
                @close="handleClose">
                <el-sub-menu :index="item.title" v-for="(item, index) in menuList" :key="index">
                  <template #title>
                    <span class="icon" :class="['iconfont', item.icon]"></span>
                    <span class="menu-title">{{ item.title }}</span>
                  </template>
                  <el-menu-item v-for="(subItem, index) in item.children" :key="index" :index="subItem.title">
                    <router-link :to="subItem.path" :class="[
          'sub-menu-item',
          activePath == subItem.path ? 'active' : ''
        ]" v-if="subItem.roleType == null ||
          subItem.roleType == userInfo.roleType
          ">
                      {{ subItem.title }}</router-link>
                  </el-menu-item>
                </el-sub-menu>
              </el-menu>
            </el-col>
          </el-row>
        </el-aside>
        <el-main class="right-main"> <router-view></router-view></el-main>
      </el-container>
    </el-container>
    <Dialog :show="progressDialog.show" :title="progressDialog.title" :buttons="progressDialog.buttons" width="400px"
      :show-close="false" :showCancel="false" @close="progressDialog.show = false">
      <div class="progress-container">
        <div class="progress-panel">
          <el-progress type="circle" :percentage="progressInfo.progress" :status="progressInfo.status" :color="colors">
          </el-progress>
        </div>
        <div class="error" v-if="progressInfo.result == 0">
          <div>生成页面出错了：{{ progressInfo.errorMsg }}</div>
          <div class="info">具体错误，请查看服务器日志</div>
        </div>
        <div class="success" v-if="progressInfo.progress == 100 && progressInfo.result == 1">
          发布成功
        </div>
        <div class="btn-panel" v-if="progressInfo.progress == 100 || progressInfo.result == 0">
          <el-button class="btn" type="primary" @click="progressDialog.show = false">关闭</el-button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ArrowDown } from '@element-plus/icons-vue'
import { getCurrentInstance, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
const store = useStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()
const api = {
  getUserInfo: 'getUserInfo',
  logout: 'logout',
  createHtml: 'createHtml',
  checkProgress: 'checkProgress'
}
const menuList = ref([
  {
    title: '博客',
    icon: 'icon-blog',
    open: true,
    children: [
      {
        title: '博客管理',
        path: '/blog/list'
      },
      {
        title: '分类管理',
        path: '/blog/category'
      }
    ]
  },
  {
    title: '专题',
    icon: 'icon-zhuanti',
    open: true,
    children: [
      {
        title: '专题管理',
        path: '/special/list'
      }
    ]
  },
  {
    title: '设置',
    icon: 'icon-setting',
    open: true,
    children: [
      {
        title: '个人信息管理',
        path: '/settings/my'
      },
      {
        title: '博客成员',
        path: '/settings/teamUser'
      },
      {
        title: '系统设置',
        path: '/settings/sysSetting',
        roleType: 1
      }
    ]
  },
  {
    title: '回收站',
    icon: 'icon-recovery',
    open: true,
    children: [
      {
        title: '回收站',
        path: '/recovery/list'
      }
    ]
  }
])
const handleOpen = (res) => { }
const handleClose = (res) => { }

//页面顶部头部信息
const userInfo = ref({})
const getUserInfo = async () => {
  let result = await proxy.Request({
    url: api.getUserInfo
  })
  if (!result) {
    return
  }
  userInfo.value = result.data
  userInfo.value.avatar = proxy.globalInfo.imageUrl + result.data.avatar
}
getUserInfo()

//监听路由变化，当选择左侧菜单显示不同内容
//接受地址
const activePath = ref(null)
watch(
  route,
  (newVal, oldVal) => {
    // 使地址=现在的地址
    activePath.value = newVal.path
  },
  { immediate: true, deep: true }
)

//退出
const logout = () => {
  proxy.Confirm('你确定要退出吗?', async () => {
    let result = await proxy.Request({
      url: api.logout
    })
    if (!result) {
      return
    }
    proxy.Message.success('退出成功')
    router.push('/login')
  })
}

//监听store
watch(
  () => store.state.userInfo,
  (newVal, oldVal) => {
    const avatar = proxy.globalInfo.imageUrl + newVal.avatar
    const nickName = newVal.nickName
    userInfo.value = { avatar, nickName }
  },
  { immediate: true, deep: true }
)
//发布模块相关逻辑
const colors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#6f7ad3', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#5cb87a', percentage: 100 }
]

const progressDialog = reactive({
  title: '发布',
  buttons: [],
  show: false
})
const progressInfo = reactive({
  progress: 0
})

let checkTimer = null

//当点击发布按钮
const createHtml = async () => {
  progressDialog.show = true
  progressInfo.progress = 0
  progressInfo.status = undefined
  let result = await proxy.Request({
    url: api.createHtml
  })
  if (!result) {
    return
  }
  checkProgress()
  checkTimer = setInterval(() => {
    checkProgress()
  }, 1000)
}
//发布进度
const checkProgress = async () => {
  let result = await proxy.Request({
    url: api.checkProgress,
    showLoading: false
  })
  if (!result) {
    return
  }
  if (result.data.result == 0) {
    progressInfo.status = 'exception'
    progressInfo.errorMsg = result.data.errorMsg
  } else {
    progressInfo.progress = result.data.progress
  }
  progressInfo.result = result.data.result
  if (
    (result.data.progress == 100 || result.data.result == 0) &&
    checkTimer != null
  ) {
    clearInterval(checkTimer)
  }
}

</script>

<style lang="scss">
.layout {

  .header {
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: space-between;

    img {
      width: 50px;
      height: 50px;
    }

    .userinfo {
      display: flex;
      align-items: center;

      .nick-name {
        color: rgba(6, 143, 234);
        cursor: pointer;
        font-size: 15px;
      }

      .avatar {
        margin-left: 10px;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 100%;
          border-radius: 25px;
        }
      }
    }
  }

  .contaniner {
    background-color: #f5f6f7;
    height: calc(100vh - 60px);
    padding-top: 10px;

    .left-aside {
      width: 230px;
      padding: 0px 10px;

      .post-Btn {
        background: green;
        color: #fff;
        height: 40px;
        width: 100%;
      }

      .menu-title {
        font-size: 15px;
      }

      .icon {
        margin-right: 8px;
      }

      .sub-menu-item {
        text-decoration: none;
        color: #3f4042;
      }

      .active {
        color: blue;
      }
    }

    .right-main {
      position: relative;
      background: #fff;
      padding: 20px 10px 10px 10px;
    }
  }
}

.progress-container {
  .progress-panel {
    display: flex;
    justify-content: center;
  }

  .error {
    color: red;
    margin-top: 20px;

    .info {
      font-size: 13px;
    }
  }

  .success {
    margin-top: 20px;
    text-align: center;
    font-size: 16px;
    color: green;
  }

  .btn-panel {
    margin-top: 20px;
    text-align: center;

    .btn {
      margin: 0px auto;
    }
  }
}
</style>
