<template>
  <div>
    <Window
      :show="windowConfig.show"
      :buttons="windowConfig.buttons"
      :showCancel="false"
      @close="windowConfig.show = false"
    >
      <div class="title">{{ blog.title }}</div>
      <div v-html="blog.content" class="blog-detail"></div>
    </Window>
  </div>
</template>

<script setup>
import h1js from 'highlight.js'
import 'highlight.js/styles/atom-one-light.css'

import { getCurrentInstance, ref, reactive, nextTick } from 'vue'
const { proxy } = getCurrentInstance()
const blog = ref({})
const api = {
  getBlogDetail: '/blog/getBlogById'
}

const windowConfig = reactive({
  show: false,
  buttons: [
    {
      type: 'danger',
      text: '确定',
      click: (e) => {
        windowConfig.show = false
      }
    }
  ]
})
const showDetail = async (blogId) => {
  windowConfig.show = true
  let result = await proxy.Request({
    url: api.getBlogDetail,
    params: {
      blogId
    }
  })
  if (!result) {
    return
  }
  blog.value = result.data
  nextTick(() => {
    //页面加载完，通过js寻找code，高亮显示
    let blocks = document.querySelectorAll('pre code')
    blocks.forEach((block) => {
      h1js.highlightBlock(block)
    })
  })
}
defineExpose({ showDetail })
</script>

<style lang="scss" scoped>
.title {
  font-size: 18px;
}
.blog-detail {
  blockquote {
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
  }
  img {
    max-width: 80%;
  }
}
</style>
