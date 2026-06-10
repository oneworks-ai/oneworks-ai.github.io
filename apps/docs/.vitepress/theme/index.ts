import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'

import DocsNavTitle from './components/DocsNavTitle.vue'
import MarkdownPageTools from './components/MarkdownPageTools.vue'
import SidebarDirectorySearch from './components/SidebarDirectorySearch.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'aside-top': () => h(MarkdownPageTools),
      'layout-top': () => h(DocsNavTitle),
      'sidebar-nav-before': () => h(SidebarDirectorySearch)
    })
  }
} satisfies Theme
