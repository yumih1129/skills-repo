// This file is auto-generated. Do not edit manually.

export type SkillStatus = 'active' | 'draft' | 'deprecated' | 'recommended'

export interface SkillMeta {
  name: string
  ownerId: string
  slug: string
  icon: string
  iconType?: 'emoji' | 'library' | 'svg'
  iconLibrary?: string
  description: string
  homepage: string
  tags: string[]
  version: string
  publishedAt: number
  updatedAt: number
  license: string
  language: string
  status?: SkillStatus
  category?: string
}

export interface Skill extends Omit<SkillMeta, 'license'> {
  id: string
  hasDocs: boolean
  hasEvaluation: boolean
  docsPath: string
  evaluationPath: string
}

export interface SkillsManifest {
  skills: Skill[]
  categories: string[]
  generatedAt: string
}

// Cast through unknown to allow extra properties from source data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _manifestData = {
  "skills": [
    {
      "name": "News Briefing Search",
      "ownerId": "Yumih",
      "slug": "news-briefing-search",
      "icon": "Newspaper",
      "iconType": "library",
      "iconLibrary": "lucide",
      "description": "根据指定时间输入（时间点、时间段或相对时间）或按最新顺序检索特定主题新闻，并整理为结构化新闻简报，支持多语言新闻检索与摘要。",
      "homepage": "https://github.com/yumih1129/skills-repo/tree/main/skills/news-briefing-search",
      "tags": [
        "新闻",
        "搜索",
        "多语言"
      ],
      "category": "信息检索",
      "version": "1.7.0",
      "publishedAt": 1747526400000,
      "updatedAt": 1779742306000,
      "license": "MIT",
      "language": "zh-CN",
      "status": "active",
      "id": "news-briefing-search",
      "hasDocs": true,
      "hasEvaluation": true,
      "docsPath": "/docs/news-briefing-search.md",
      "evaluationPath": "/evaluations/news-briefing-search.md"
    },
    {
      "name": "Requirements Brief",
      "ownerId": "Yumih",
      "slug": "requirements-brief",
      "icon": "ClipboardList",
      "iconType": "library",
      "iconLibrary": "lucide",
      "description": "将用户口语化、零散或模糊的需求整理为结构化、可交付的需求简报。",
      "homepage": "https://github.com/yumih1129/skills-repo/tree/main/skills/requirements-brief",
      "tags": [
        "需求",
        "分析",
        "简报"
      ],
      "category": "开发工具",
      "version": "1.0.0",
      "publishedAt": 1779458936701,
      "updatedAt": 1779458936701,
      "license": "MIT",
      "language": "zh-CN",
      "status": "active",
      "id": "requirements-brief",
      "hasDocs": true,
      "hasEvaluation": true,
      "docsPath": "/docs/requirements-brief.md",
      "evaluationPath": "/evaluations/requirements-brief.md"
    },
    {
      "name": "Skill Create",
      "ownerId": "Yumih",
      "slug": "skill-create",
      "icon": "PencilRuler",
      "iconType": "library",
      "iconLibrary": "lucide",
      "description": "用于创建、重构、修正和归档任意 SKILL，并通过结构排查、质量评估与验证形成可交付闭环的技能。",
      "homepage": "https://github.com/yumih1129/skills-repo/tree/main/skills/skill-create",
      "tags": [
        "创建",
        "重构",
        "SKILL"
      ],
      "category": "开发工具",
      "version": "1.0.0",
      "publishedAt": 1779198159000,
      "updatedAt": 1779198159000,
      "license": "MIT",
      "language": "zh-CN",
      "status": "active",
      "id": "skill-create",
      "hasDocs": true,
      "hasEvaluation": true,
      "docsPath": "/docs/skill-create.md",
      "evaluationPath": "/evaluations/skill-create.md"
    },
    {
      "name": "Skill Evaluate",
      "ownerId": "Yumih",
      "slug": "skill-evaluate",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-scale-icon lucide-scale\"><path d=\"M12 3v18\"/><path d=\"m19 8 3 8a5 5 0 0 1-6 0zV7\"/><path d=\"M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1\"/><path d=\"m5 8 3 8a5 5 0 0 1-6 0zV7\"/><path d=\"M7 21h10\"/></svg>",
      "iconType": "svg",
      "description": "对任意 SKILL 做证据化质量评审、客观评分、问题分级、交付把关与复评闭环的评估型技能。",
      "homepage": "https://github.com/yumih1129/skills-repo/tree/main/skills/skill-evaluate",
      "tags": [
        "评估",
        "质量",
        "评分"
      ],
      "category": "质量保障",
      "version": "1.1.0",
      "publishedAt": 1779204258000,
      "updatedAt": 1779740560000,
      "license": "MIT",
      "language": "zh-CN",
      "status": "active",
      "id": "skill-evaluate",
      "hasDocs": true,
      "hasEvaluation": true,
      "docsPath": "/docs/skill-evaluate.md",
      "evaluationPath": "/evaluations/skill-evaluate.md"
    },
    {
      "name": "Skill Manual Generator",
      "ownerId": "Yumih",
      "slug": "skill-manual-generate",
      "icon": "FileText",
      "iconType": "library",
      "iconLibrary": "lucide",
      "description": "读取任意 SKILL 目录，理解其能力与边界，并根据目标复杂度与用户意图自动选择标准或极简模板，生成以 slug 命名的中文使用手册。",
      "homepage": "https://github.com/yumih1129/skills-repo/tree/main/skills/skill-manual-generate",
      "tags": [
        "文档",
        "手册",
        "模板"
      ],
      "category": "开发工具",
      "version": "1.1.0",
      "publishedAt": 1779379200000,
      "updatedAt": 1779736111866,
      "license": "MIT",
      "language": "zh-CN",
      "status": "active",
      "id": "skill-manual-generate",
      "hasDocs": true,
      "hasEvaluation": true,
      "docsPath": "/docs/skill-manual-generate.md",
      "evaluationPath": "/evaluations/skill-manual-generate.md"
    },
    {
      "name": "Skill Stabilize",
      "ownerId": "Yumih",
      "slug": "skill-stabilize",
      "icon": "ShieldCheck",
      "iconType": "library",
      "iconLibrary": "lucide",
      "description": "对已有 SKILL 做不改变能力边界的收口稳定化优化，减少歧义与漂移，提升重复评测一致性，并将评估结论直接落地为修订结果。",
      "homepage": "https://github.com/yumih1129/skills-repo/tree/main/skills/skill-stabilize",
      "tags": [
        "SKILL",
        "优化",
        "收口"
      ],
      "category": "开发工具",
      "version": "1.0.0",
      "publishedAt": 1779536071000,
      "updatedAt": 1779536071000,
      "license": "MIT",
      "language": "zh-CN",
      "status": "active",
      "id": "skill-stabilize",
      "hasDocs": true,
      "hasEvaluation": true,
      "docsPath": "/docs/skill-stabilize.md",
      "evaluationPath": "/evaluations/skill-stabilize.md"
    },
    {
      "name": "WeChat Article HTML Exporter",
      "ownerId": "Yumih",
      "slug": "wechat-article-html-exporter",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1.13em\" height=\"1em\" viewBox=\"0 0 576 512\"><path fill=\"currentColor\" d=\"M385.2 167.6c6.4 0 12.6.3 18.8 1.1C387.4 90.3 303.3 32 207.7 32C100.5 32 13 104.8 13 197.4c0 53.4 29.3 97.5 77.9 131.6l-19.3 58.6l68-34.1c24.4 4.8 43.8 9.7 68.2 9.7c6.2 0 12.1-.3 18.3-.8c-4-12.9-6.2-26.6-6.2-40.8c-.1-84.9 72.9-154 165.3-154m-104.5-52.9c14.5 0 24.2 9.7 24.2 24.4c0 14.5-9.7 24.2-24.2 24.2c-14.8 0-29.3-9.7-29.3-24.2c.1-14.7 14.6-24.4 29.3-24.4m-136.4 48.6c-14.5 0-29.3-9.7-29.3-24.2c0-14.8 14.8-24.4 29.3-24.4c14.8 0 24.4 9.7 24.4 24.4c0 14.6-9.6 24.2-24.4 24.2M563 319.4c0-77.9-77.9-141.3-165.4-141.3c-92.7 0-165.4 63.4-165.4 141.3S305 460.7 397.6 460.7c19.3 0 38.9-5.1 58.6-9.9l53.4 29.3l-14.8-48.6C534 402.1 563 363.2 563 319.4m-219.1-24.5c-9.7 0-19.3-9.7-19.3-19.6c0-9.7 9.7-19.3 19.3-19.3c14.8 0 24.4 9.7 24.4 19.3c0 10-9.7 19.6-24.4 19.6m107.1 0c-9.7 0-19.3-9.7-19.3-19.6c0-9.7 9.7-19.3 19.3-19.3c14.5 0 24.4 9.7 24.4 19.3c.1 10-9.9 19.6-24.4 19.6\"/></svg>",
      "iconType": "svg",
      "description": "将主题、素材、草稿、Markdown 或正文先在对话中整理为标准、准确、适合微信公众号发布的 Markdown 成稿；执行只依赖技能目录内规则，自包含完成主题化排版，确认后再输出精美整齐的微信兼容内联样式 HTML，用户明确要求时可选落盘为 HTML 文件。",
      "homepage": "https://github.com/yumih1129/skills-repo/tree/main/skills/wechat-article-html-exporter",
      "tags": [
        "微信公众号",
        "HTML",
        "排版"
      ],
      "category": "内容创作",
      "version": "1.3.6",
      "publishedAt": 1779806315767,
      "updatedAt": 1779814984000,
      "license": "MIT",
      "language": "zh-CN",
      "status": "active",
      "id": "wechat-article-html-exporter",
      "hasDocs": true,
      "hasEvaluation": true,
      "docsPath": "/docs/wechat-article-html-exporter.md",
      "evaluationPath": "/evaluations/wechat-article-html-exporter.md"
    }
  ],
  "categories": [
    "全部",
    "信息检索",
    "开发工具",
    "质量保障",
    "内容创作"
  ],
  "generatedAt": "2026-05-27T01:11:55.349+08:00"
} as any

export const manifestData: SkillsManifest = _manifestData
export const skills: Skill[] = _manifestData.skills
export const categories: string[] = _manifestData.categories
