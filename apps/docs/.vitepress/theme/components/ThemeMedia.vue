<script setup lang="ts">
import { useData } from 'vitepress'
import { onBeforeUpdate, ref } from 'vue'

const { isDark } = useData()
const root = ref<HTMLElement | null>(null)

onBeforeUpdate(() => {
  for (const video of root.value?.querySelectorAll('video') ?? []) {
    video.pause()
  }
})
</script>

<template>
  <div ref="root" class="oneworks-doc-theme-media">
    <slot v-if="isDark" name="dark" />
    <slot v-else name="light" />
  </div>
</template>
