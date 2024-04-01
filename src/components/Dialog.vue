<template>
  <!-- 封装弹窗组件 -->
  <div>
    <el-dialog
      :show-close="showClose"
      :model-value="show"
      :close-on-click-modal="false"
      :title="title"
      class="cust-dialog"
      :top="top"
      :width="width"
      :showCancel="showCancel"
      @close="close"
    >
      <div class="dialog-body">
        <slot></slot>
      </div>
      <!-- 按钮插槽 -->

      <template v-if="(buttons && buttons.length > 0) || showCancel">
        <div class="dialog-footer">
          <el-button link @click="close">取消</el-button>
          <el-button
            v-for="btn in buttons"
            :type="btn.type"
            @click="btn.click"
            >{{ btn.text }}</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  showClose: {
    type: Boolean,
    default: true
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  title: {
    type: String
  },
  //离上边的距离
  top: {
    type: String,
    default: '50px'
  },
  width: {
    type: String,
    default: '30%'
  },
  buttons: {
    type: Array
  }
})
// 自己不能做，需要交给父组件来做
const emit = defineEmits()
const close = () => {
  emit('close')
}
</script>

<style lang="scss">
.cust-dialog {
  .el-dialog__body {
    padding: 0px;
  }
  .dialog-body {
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    padding: 15px;
    min-height: 80px;
  }
  .dialog-footer {
    text-align: right;
    padding: 5px 10px;
  }
}
</style>
