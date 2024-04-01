<template>
  <div>
    <!-- <EditorMarkdown v-model="markdownContent"></EditorMarkdown> -->
    <EditorHtml v-model="markdownContent"></EditorHtml>
    {{ markdownContent }}
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
const markdownContent = ref('# test')
</script>

<style lang="scss" scoped></style>
