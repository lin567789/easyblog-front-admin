<template>
  <!-- 封面单独抽离出来，因为大部分都要用到，但是有的有图片，有的没有。 -->
  <div class="cover">
    <img :src="proxy.globalInfo.imageUrl + cover" v-if="cover" />
    <img v-else src="../assets/default_img.jpg" />
  </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  cover: {
    type: String
  }
})
</script>

<style lang="scss" scoped>
.cover {
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  overflow: hidden;
  img {
    width: 100%;
  }
}
</style>
