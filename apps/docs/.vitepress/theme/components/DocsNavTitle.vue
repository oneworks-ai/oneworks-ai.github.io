<script setup lang="ts">
import { useData, useRoute, withBase } from 'vitepress'
import { nextTick, onMounted, watch } from 'vue'

const homepageUrl = import.meta.env.VITE_ONEWORKS_DOCS_HOMEPAGE_URL ?? '/'
const { localeIndex } = useData()
const route = useRoute()

function createLogo(): HTMLImageElement {
  const logo = document.createElement('img')
  logo.alt = 'One Works'
  logo.className = 'VPImage logo'
  logo.decoding = 'async'
  logo.src = withBase('/oneworks.svg')
  return logo
}

function renderTitle(): void {
  if (typeof document === 'undefined') {
    return
  }

  const host = document.querySelector<HTMLElement>('.VPNavBarTitle')
  if (!host) {
    return
  }

  const current = host.querySelector<HTMLElement>('.oneworks-doc-brand-title')
  const defaultTitle = host.querySelector<HTMLElement>('a.title')
  const target = current ?? defaultTitle
  if (!target) {
    return
  }

  const isEnglish = localeIndex.value === 'en'
  const title = document.createElement('div')
  title.className = 'title oneworks-doc-brand-title'
  title.setAttribute(
    'aria-label',
    isEnglish ? 'One Works Docs' : 'One Works 文档'
  )

  const productLink = document.createElement('a')
  productLink.className = 'oneworks-doc-brand-product'
  productLink.href = homepageUrl
  productLink.append(createLogo())
  productLink.append(document.createTextNode('One Works'))

  const divider = document.createElement('span')
  divider.className = 'oneworks-doc-brand-divider'
  divider.textContent = '/'

  const docsLink = document.createElement('a')
  docsLink.className = 'oneworks-doc-brand-docs'
  docsLink.href = withBase(isEnglish ? '/en/' : '/')
  docsLink.textContent = isEnglish ? 'Docs' : '文档'

  title.append(productLink, divider, docsLink)
  target.replaceWith(title)
}

function scheduleRender(): void {
  void nextTick(renderTitle)
}

onMounted(scheduleRender)

watch(() => route.path, scheduleRender)
watch(localeIndex, scheduleRender)
</script>

<template>
  <span hidden />
</template>
