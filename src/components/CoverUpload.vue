<template>
  <!-- 封装封面组件，即很多页面都需要用到 -->
  <el-upload
    name="file"
    :show-file-list="false"
    accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.bmp,.BMP"
    :multiple="false"
    :http-request="uploadImage"
  >
    <template v-if="modelValue">
      <img :src="proxy.globalInfo.imageUrl + modelValue" />
    </template>
    <el-icon v-else class="el-icon--right"><DocumentAdd /></el-icon>
  </el-upload>
</template>

<script setup>
import { DocumentAdd } from '@element-plus/icons-vue'
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: {
    type: String,
    default: null
  }
})

const api = {
  uploadUrl: 'file/uploadImage'
}

const emit = defineEmits()
const uploadImage = async (file) => {
  let result = await proxy.Request({
    url: api.uploadUrl,
    dataType: 'file',
    params: {
      file: file.file,
      type: 0
    }
  })
  const fileName = result.data.fileName

  emit('update:modelValue', fileName)
  emit('callback', fileName)
}
</script>

<style lang="scss" scoped>
.el-icon--right {
  font-size: 50px;
}
img {
  width: 150px;
}
</style>
