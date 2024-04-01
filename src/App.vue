<template>
  <div>
    <el-config-provider :locale="locale" :message="config">
      <router-view></router-view>
    </el-config-provider>
  </div>
</template>

<script setup>
//noDate显示暂无数据 改为中文
import zhCn from 'element-plus/lib/locale/lang/zh-cn'
import { reactive } from 'vue'
const locale = zhCn

//最多一个弹窗
const config = reactive({
  max: 1
})
</script>

<style scoped></style>
