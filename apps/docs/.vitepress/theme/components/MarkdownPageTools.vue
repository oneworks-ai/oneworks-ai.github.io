<script setup lang="ts">
import { useData } from 'vitepress'
import CopyOrDownloadAsMarkdownButtons from 'vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue'
import { computed } from 'vue'

const { frontmatter, page } = useData()

const isVisible = computed(() =>
  !page.value.isNotFound && frontmatter.value.layout !== 'home'
)
</script>

<template>
  <div v-if="isVisible" class="oneworks-doc-markdown-tools">
    <CopyOrDownloadAsMarkdownButtons />
  </div>
</template>
