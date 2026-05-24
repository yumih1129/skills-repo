import * as fs from 'fs'
import * as path from 'path'
import { syncResources } from './sync-resources'

const SKILLS_DIR = path.resolve(__dirname, '../../skills')
const REPO_ROOT = path.resolve(__dirname, '../..')
const DOCS_DIR = path.join(REPO_ROOT, 'docs')
const EVALS_DIR = path.join(REPO_ROOT, 'evaluations')
const PUBLIC_DOCS_DIR = path.join(__dirname, '../public/docs')
const PUBLIC_EVALS_DIR = path.join(__dirname, '../public/evaluations')
const OUTPUT_DIR = path.resolve(__dirname, '../public')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'skills-manifest.json')

interface SkillMeta {
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
  license: string
  language: string
  status?: 'active' | 'draft' | 'deprecated' | 'recommended'
  category?: string
}

interface SkillManifest {
  skills: Array<SkillMeta & {
    id: string
    hasDocs: boolean
    hasEvaluation: boolean
    docsPath: string
    evaluationPath: string
  }>
  categories: string[]
  generatedAt: string
}

function deriveCategory(slug: string): string {
  const keywordMap: Record<string, string> = {
    'skill-create': '开发工具',
    'skill-evaluate': '质量保障',
    'skill-': '开发工具',
    'topic-': '信息检索',
    'news-': '信息检索',
    'search': '信息检索',
    'code-': '开发工具',
  }

  for (const [key, category] of Object.entries(keywordMap)) {
    if (slug.includes(key)) return category
  }
  return '其他'
}

function scanSkills(): { skills: SkillManifest['skills']; categories: Set<string> } {
  const skills: SkillManifest['skills'] = []
  const categories = new Set<string>()

  if (!fs.existsSync(SKILLS_DIR)) {
    console.warn('[manifest] skills dir not found')
    return { skills, categories }
  }

  const skillFolders = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())

  for (const folder of skillFolders) {
    const metaPath = path.join(SKILLS_DIR, folder.name, '_meta.json')

    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as SkillMeta
        const slug = meta.slug || folder.name
        const category = meta.category || deriveCategory(slug)

        categories.add(category)

        // Check for docs/evaluations in PUBLIC directory (after sync)
        const publicDocsPath = path.join(PUBLIC_DOCS_DIR, `${slug}.md`)
        const publicEvalPath = path.join(PUBLIC_EVALS_DIR, `${slug}.md`)
        const hasDocs = fs.existsSync(publicDocsPath)
        const hasEvaluation = fs.existsSync(publicEvalPath)

        skills.push({
          ...meta,
          id: folder.name,
          slug,
          category,
          status: meta.status || 'active',
          hasDocs,
          hasEvaluation,
          docsPath: hasDocs ? `/docs/${slug}.md` : '',
          evaluationPath: hasEvaluation ? `/evaluations/${slug}.md` : '',
        })
      } catch (e) {
        console.error(`[manifest] parse error: ${folder.name}`)
      }
    } else {
      console.warn(`[manifest] no _meta.json: ${folder.name}`)
    }
  }

  return { skills, categories }
}

function main() {
  syncResources()

  const { skills, categories } = scanSkills()

  const manifest: SkillManifest = {
    skills,
    categories: ['全部', ...Array.from(categories)],
    generatedAt: new Date().toISOString(),
  }

  // Write JSON for runtime fetch (public directory)
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2))

  // Write TypeScript file for static import (src/generated)
  const tsOutputDir = path.resolve(__dirname, '../src/generated')
  if (!fs.existsSync(tsOutputDir)) {
    fs.mkdirSync(tsOutputDir, { recursive: true })
  }

  const tsOutputFile = path.join(tsOutputDir, 'skills-manifest.ts')
  const tsContent = `// This file is auto-generated. Do not edit manually.
// Generated at: ${manifest.generatedAt}

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
const _manifestData = ${JSON.stringify(manifest, null, 2)} as any

export const manifestData: SkillsManifest = _manifestData
export const skills: Skill[] = _manifestData.skills
export const categories: string[] = _manifestData.categories
`
  fs.writeFileSync(tsOutputFile, tsContent)

  console.log(`[manifest] ${manifest.skills.length} skills, ${manifest.categories.length - 1} categories`)
}

main()
