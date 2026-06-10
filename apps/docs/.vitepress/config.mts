import { type DefaultTheme, defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

const repositoryUrl = 'https://github.com/oneworks-ai/app'
const homepageUrl = process.env.VITE_ONEWORKS_DOCS_HOMEPAGE_URL?.trim() || '/'

const usageSidebar: DefaultTheme.SidebarItem[] = [
  {
    collapsed: false,
    items: [
      { link: '/usage/install', text: '安装与准备' },
      { link: '/usage/workspaces', text: 'Workspace 调度' },
      { link: '/usage/examples', text: '示例目录' }
    ],
    text: '开始使用'
  },
  {
    collapsed: false,
    items: [
      { link: '/usage/desktop', text: '桌面应用' },
      { link: '/usage/vscode-extension', text: 'VS Code 扩展' }
    ],
    text: '客户端'
  },
  {
    collapsed: false,
    items: [
      { link: '/usage/web', text: 'Web UI' },
      { link: '/usage/pwa', text: 'PWA' },
      { link: '/usage/pwa/operations', text: 'PWA 运维' }
    ],
    text: 'Web / PWA'
  }
]

const referenceSidebar: DefaultTheme.SidebarItem[] = [
  {
    items: [
      { link: '/asset-directories', text: '数据资产目录' }
    ],
    text: '总览'
  },
  {
    collapsed: false,
    items: [
      { link: '/usage/cli', text: 'CLI' },
      { link: '/usage/runtime', text: 'Runtime' },
      { link: '/usage/adapter-cli', text: 'Adapter CLI' },
      { link: '/usage/adapters', text: '适配器配置' },
      { link: '/usage/channels', text: 'Channel 会话绑定' }
    ],
    text: '运行时与适配器'
  }
]

const extensionSidebar: DefaultTheme.SidebarItem[] = [
  {
    collapsed: false,
    items: [
      { link: '/usage/plugins', text: '插件总览' },
      { link: '/usage/plugins/ui-runtime', text: 'UI Runtime' },
      { link: '/usage/plugins/server-runtime', text: 'Server Runtime' },
      { link: '/usage/plugins/assets-and-adapters', text: '资产与适配器' },
      { link: '/usage/plugins/entity-inheritance', text: 'Entity 继承' },
      { link: '/usage/plugins/entity-default-files', text: 'Entity 默认文件' },
      { link: '/usage/plugins/local-rules', text: '本地规则' },
      { link: '/usage/native-plugins', text: '原生插件' },
      { link: '/usage/native-plugins/marketplaces', text: 'Marketplace' }
    ],
    text: '插件系统'
  },
  {
    collapsed: false,
    items: [
      { link: '/usage/skills', text: 'Skills 总览' },
      { link: '/usage/skills/resolution', text: 'Skill 解析' },
      { link: '/usage/skills/project-management', text: '项目管理' },
      { link: '/usage/skills/home-bridge', text: 'Home Bridge' }
    ],
    text: 'Skills'
  }
]

const sidebar: DefaultTheme.Sidebar = {
  '/usage/plugins': extensionSidebar,
  '/usage/native-plugins': extensionSidebar,
  '/usage/skills': extensionSidebar,
  '/usage/cli': referenceSidebar,
  '/usage/runtime': referenceSidebar,
  '/usage/adapter-cli': referenceSidebar,
  '/usage/adapters': referenceSidebar,
  '/usage/channels': referenceSidebar,
  '/asset-directories': referenceSidebar,
  '/usage/': usageSidebar,
  '/': usageSidebar
}

const englishUsageSidebar: DefaultTheme.SidebarItem[] = [
  {
    collapsed: false,
    items: [
      { link: '/en/usage/install', text: 'Install and Prepare' },
      { link: '/en/usage/workspaces', text: 'Workspace Scheduling' },
      { link: '/en/usage/examples', text: 'Examples Directory' }
    ],
    text: 'Getting Started'
  },
  {
    collapsed: false,
    items: [
      { link: '/en/usage/desktop', text: 'Desktop App' },
      { link: '/en/usage/vscode-extension', text: 'VS Code Extension' }
    ],
    text: 'Clients'
  },
  {
    collapsed: false,
    items: [
      { link: '/en/usage/web', text: 'Web UI' },
      { link: '/en/usage/pwa', text: 'PWA' },
      { link: '/en/usage/pwa/operations', text: 'PWA Operations' }
    ],
    text: 'Web / PWA'
  }
]

const englishReferenceSidebar: DefaultTheme.SidebarItem[] = [
  {
    items: [
      { link: '/en/asset-directories', text: 'Data Asset Directories' }
    ],
    text: 'Overview'
  },
  {
    collapsed: false,
    items: [
      { link: '/en/usage/cli', text: 'CLI' },
      { link: '/en/usage/runtime', text: 'Runtime' },
      { link: '/en/usage/adapter-cli', text: 'Adapter CLI' },
      { link: '/en/usage/adapters', text: 'Adapter Configuration' },
      { link: '/en/usage/channels', text: 'Channel Binding' }
    ],
    text: 'Runtime and Adapters'
  }
]

const englishExtensionSidebar: DefaultTheme.SidebarItem[] = [
  {
    collapsed: false,
    items: [
      { link: '/en/usage/plugins', text: 'Plugin Overview' },
      { link: '/en/usage/plugins/ui-runtime', text: 'UI Runtime' },
      { link: '/en/usage/plugins/server-runtime', text: 'Server Runtime' },
      { link: '/en/usage/plugins/assets-and-adapters', text: 'Assets and Adapters' },
      { link: '/en/usage/plugins/entity-inheritance', text: 'Entity Inheritance' },
      { link: '/en/usage/plugins/entity-default-files', text: 'Entity Default Files' },
      { link: '/en/usage/plugins/local-rules', text: 'Local Rules' },
      { link: '/en/usage/native-plugins', text: 'Native Plugins' },
      { link: '/en/usage/native-plugins/marketplaces', text: 'Marketplaces' }
    ],
    text: 'Plugin System'
  },
  {
    collapsed: false,
    items: [
      { link: '/en/usage/skills', text: 'Skills Overview' },
      { link: '/en/usage/skills/resolution', text: 'Skill Resolution' },
      { link: '/en/usage/skills/project-management', text: 'Project Management' },
      { link: '/en/usage/skills/home-bridge', text: 'Home Bridge' }
    ],
    text: 'Skills'
  }
]

const englishSidebar: DefaultTheme.Sidebar = {
  '/en/usage/plugins': englishExtensionSidebar,
  '/en/usage/native-plugins': englishExtensionSidebar,
  '/en/usage/skills': englishExtensionSidebar,
  '/en/usage/cli': englishReferenceSidebar,
  '/en/usage/runtime': englishReferenceSidebar,
  '/en/usage/adapter-cli': englishReferenceSidebar,
  '/en/usage/adapters': englishReferenceSidebar,
  '/en/usage/channels': englishReferenceSidebar,
  '/en/asset-directories': englishReferenceSidebar,
  '/en/usage/': englishUsageSidebar,
  '/en/': englishUsageSidebar
}

export default defineConfig({
  appearance: true,
  base: '/docs/',
  cleanUrls: true,
  description: 'One Works 使用文档、接入方式和运行说明。',
  head: [
    ['link', { href: '/docs/oneworks.svg', rel: 'icon', type: 'image/svg+xml' }]
  ],
  lang: 'zh-CN',
  lastUpdated: true,
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN'
    },
    en: {
      description: 'One Works usage documentation and integration guide.',
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      themeConfig: {
        darkModeSwitchLabel: 'Appearance',
        darkModeSwitchTitle: 'Switch to dark theme',
        docFooter: {
          next: 'Next page',
          prev: 'Previous page'
        },
        footer: {
          copyright: 'Copyright © 2026 One Works',
          message: 'Standalone One Works documentation site for user integration and usage.'
        },
        editLink: {
          pattern: `${repositoryUrl}/edit/main/assets/homepage/apps/docs/:path`,
          text: 'Edit this page'
        },
        langMenuLabel: 'Change language',
        lastUpdated: {
          text: 'Last updated'
        },
        lightModeSwitchTitle: 'Switch to light theme',
        logoLink: homepageUrl,
        nav: [
          {
            activeMatch: '/en/usage/(install|workspaces|examples|desktop|web|pwa|vscode-extension)',
            items: [
              { link: '/en/usage/install', text: 'Install and Prepare' },
              { link: '/en/usage/workspaces', text: 'Workspace Scheduling' },
              { link: '/en/usage/examples', text: 'Examples Directory' },
              { link: '/en/usage/desktop', text: 'Desktop App' },
              { link: '/en/usage/web', text: 'Web UI' },
              { link: '/en/usage/pwa', text: 'PWA' },
              { link: '/en/usage/vscode-extension', text: 'VS Code Extension' }
            ],
            text: 'Usage'
          },
          {
            activeMatch: '/en/usage/(plugins|native-plugins|skills)',
            items: [
              { link: '/en/usage/plugins', text: 'Plugin System' },
              { link: '/en/usage/native-plugins', text: 'Native Plugins' },
              { link: '/en/usage/skills', text: 'Skills' }
            ],
            text: 'Extensions'
          },
          {
            activeMatch: '/en/usage/(cli|runtime|adapter-cli|adapters|channels)|/en/asset-directories',
            items: [
              { link: '/en/usage/cli', text: 'CLI' },
              { link: '/en/usage/runtime', text: 'Runtime' },
              { link: '/en/usage/adapter-cli', text: 'Adapter CLI' },
              { link: '/en/usage/adapters', text: 'Adapter Configuration' },
              { link: '/en/usage/channels', text: 'Channel Binding' },
              { link: '/en/asset-directories', text: 'Data Asset Directories' }
            ],
            text: 'Reference'
          }
        ],
        outline: {
          label: 'On this page',
          level: [2, 3]
        },
        returnToTopLabel: 'Return to top',
        search: {
          options: {
            translations: {
              button: {
                buttonAriaLabel: 'Search docs',
                buttonText: 'Search docs'
              },
              modal: {
                backButtonTitle: 'Back',
                displayDetails: 'Display details',
                footer: {
                  closeKeyAriaLabel: 'Escape',
                  closeText: 'Close',
                  navigateDownKeyAriaLabel: 'Arrow down',
                  navigateText: 'Navigate',
                  navigateUpKeyAriaLabel: 'Arrow up',
                  selectKeyAriaLabel: 'Enter',
                  selectText: 'Select'
                },
                noResultsText: 'No results found',
                resetButtonTitle: 'Reset search'
              }
            }
          },
          provider: 'local'
        },
        sidebar: englishSidebar,
        sidebarMenuLabel: 'Menu',
        siteTitle: 'One Works / Docs'
      },
      title: 'One Works Docs'
    }
  },
  srcExclude: ['**/AGENTS.md'],
  markdown: {
    image: {
      lazyLoading: true
    }
  },
  themeConfig: {
    docFooter: {
      next: '下一页',
      prev: '上一页'
    },
    editLink: {
      pattern: `${repositoryUrl}/edit/main/assets/homepage/apps/docs/:path`,
      text: '编辑此页'
    },
    footer: {
      copyright: 'Copyright © 2026 One Works',
      message: 'One Works 文档站独立构建，面向用户接入与使用。'
    },
    lastUpdated: {
      text: '最后更新'
    },
    logo: {
      alt: 'One Works',
      src: '/oneworks.svg'
    },
    logoLink: homepageUrl,
    nav: [
      {
        activeMatch: '/usage/(install|workspaces|examples|desktop|web|pwa|vscode-extension)',
        items: [
          { link: '/usage/install', text: '安装与准备' },
          { link: '/usage/workspaces', text: 'Workspace 调度' },
          { link: '/usage/examples', text: '示例目录' },
          { link: '/usage/desktop', text: '桌面应用' },
          { link: '/usage/web', text: 'Web UI' },
          { link: '/usage/pwa', text: 'PWA' },
          { link: '/usage/vscode-extension', text: 'VS Code 扩展' }
        ],
        text: '使用'
      },
      {
        activeMatch: '/usage/(plugins|native-plugins|skills)',
        items: [
          { link: '/usage/plugins', text: '插件系统' },
          { link: '/usage/native-plugins', text: '原生插件' },
          { link: '/usage/skills', text: 'Skills' }
        ],
        text: '扩展'
      },
      {
        activeMatch: '/usage/(cli|runtime|adapter-cli|adapters|channels)|/asset-directories',
        items: [
          { link: '/usage/cli', text: 'CLI' },
          { link: '/usage/runtime', text: 'Runtime' },
          { link: '/usage/adapter-cli', text: 'Adapter CLI' },
          { link: '/usage/adapters', text: '适配器配置' },
          { link: '/usage/channels', text: 'Channel 绑定' },
          { link: '/asset-directories', text: '数据资产目录' }
        ],
        text: '参考'
      }
    ],
    outline: {
      label: '本页目录',
      level: [2, 3]
    },
    search: {
      options: {
        translations: {
          button: {
            buttonAriaLabel: '搜索文档',
            buttonText: '搜索文档'
          },
          modal: {
            backButtonTitle: '返回',
            displayDetails: '显示详情',
            footer: {
              closeKeyAriaLabel: 'Escape',
              closeText: '关闭',
              navigateDownKeyAriaLabel: '向下',
              navigateText: '切换',
              navigateUpKeyAriaLabel: '向上',
              selectKeyAriaLabel: 'Enter',
              selectText: '选择'
            },
            noResultsText: '没有找到相关文档',
            resetButtonTitle: '清除搜索'
          }
        }
      },
      provider: 'local'
    },
    darkModeSwitchLabel: '外观',
    darkModeSwitchTitle: '切换到暗色主题',
    lightModeSwitchTitle: '切换到浅色主题',
    langMenuLabel: '切换语言',
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '目录',
    sidebar,
    siteTitle: 'One Works / 文档',
    socialLinks: [
      { icon: 'github', link: repositoryUrl }
    ]
  },
  title: 'One Works Docs',
  vite: {
    plugins: [
      llmstxt({
        details: 'One Works 用户文档，覆盖安装、桌面端、Web / PWA、CLI、运行时、插件、适配器与 Skills。',
        domain: 'https://oneworks-ai.github.io/docs/',
        title: 'One Works Docs'
      })
    ]
  }
})
