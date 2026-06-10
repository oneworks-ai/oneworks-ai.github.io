<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const query = ref('')
const { localeIndex } = useData()

const isEnglish = computed(() => localeIndex.value === 'en')
const inputLabel = computed(() =>
  isEnglish.value ? 'Search sidebar docs' : '搜索侧栏文档'
)
const inputPlaceholder = computed(() =>
  isEnglish.value ? 'Filter directory' : '过滤目录'
)
const clearLabel = computed(() =>
  isEnglish.value ? 'Clear sidebar search' : '清除侧栏搜索'
)

let observer: MutationObserver | undefined

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase()
}

function updateSidebarFilter(): void {
  if (typeof document === 'undefined') {
    return
  }

  const nav = document.querySelector<HTMLElement>('#VPSidebarNav')
  if (!nav) {
    return
  }

  const term = normalize(query.value)
  const items = Array.from(nav.querySelectorAll<HTMLElement>('.VPSidebarItem'))
  for (const item of items) {
    const content = normalize(item.textContent ?? '')
    item.classList.toggle(
      'oneworks-doc-sidebar-search-hidden',
      Boolean(term) && !content.includes(term)
    )
    item.classList.toggle(
      'oneworks-doc-sidebar-search-active',
      Boolean(term) && content.includes(term)
    )
  }
}

function clearSearch(): void {
  query.value = ''
}

onMounted(() => {
  observer = new MutationObserver(() => {
    void nextTick(updateSidebarFilter)
  })
  observer.observe(document.body, { childList: true, subtree: true })
  updateSidebarFilter()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = undefined
})

watch(query, () => {
  void nextTick(updateSidebarFilter)
})
</script>

<template>
  <div class="oneworks-doc-sidebar-search" role="search">
    <label class="oneworks-doc-sidebar-search__field">
      <svg
        aria-hidden="true"
        class="oneworks-doc-sidebar-search__icon"
        viewBox="0 0 20 20"
      >
        <path
          d="M8.5 3.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm4.14 7.08 3.14 3.14-1.06 1.06-3.14-3.14 1.06-1.06Z"
          fill="currentColor"
        />
      </svg>
      <input
        v-model="query"
        :aria-label="inputLabel"
        class="oneworks-doc-sidebar-search__input"
        :placeholder="inputPlaceholder"
        type="search"
      >
      <button
        v-if="query"
        :aria-label="clearLabel"
        class="oneworks-doc-sidebar-search__clear"
        type="button"
        @click="clearSearch"
      >
        <span aria-hidden="true">×</span>
      </button>
    </label>
  </div>
</template>
