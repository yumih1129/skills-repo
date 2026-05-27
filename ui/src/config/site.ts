export const siteConfig = {
  name: 'SKILLS',
  description: 'Skill Library',
  logo: '✦',
  github: {
    url: 'https://github.com/yumih1129/skills-repo',
    label: 'GitHub',
  },
  ui: {
    defaultTheme: 'system' as const,
    searchPlaceholder: '搜索...',
  },
  footer: {
    text: '✦ SKILLS',
    repoName: 'skills-repo',
    license: 'Apache License 2.0',
  },
} as const

export type SiteConfig = typeof siteConfig
