<template>
  <!-- 动态定义宽高 -->
  <div class="window" :style="{ width: windowWidth + 'px' }" v-if="show">
    <div class="title">
      <el-icon class="el-icon--back" @click="close"><Back /></el-icon>
    </div>
    <div class="body">
      <slot></slot>
    </div>
    <template v-if="(buttons && buttons.length > 0) || showCancel">
      <div class="footer">
        <el-button link @click="close" v-if="showCancel">取消</el-button>
        <el-button v-for="btn in buttons" :type="btn.type" @click="btn.click">{{
          btn.text
        }}</el-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { Back } from '@element-plus/icons-vue'
import { ref } from 'vue'
// 宽度等于电脑的宽度-左侧的宽度
const windowWidth = window.innerWidth - 230
const props = defineProps({
  buttons: {
    type: Array
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  show: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['close'])
const close = () => {
  emit('close')
}
</script>

<style lang="scss">
.window {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: calc(100vh - 70px);
  background: #fff;
  // 不能太大，否则会导致有些下拉框看不见
  z-index: 50;
  .title {
    display: flex;
    align-items: center;
    padding-left: 15px;
    height: 30px;
    .el-icon--back {
      font-size: 20px;
    }
  }
  .body {
    height: calc(100vh - 151px);
    padding: 10px;
    overflow: auto;
  }
  .footer {
    border-top: 1px solid #ddd;
    text-align: center;
    line-height: 50px;
  }
}
</style>
