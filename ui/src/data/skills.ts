import React from 'react'

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
  status?: 'active' | 'draft' | 'deprecated' | 'recommended'
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

let cachedManifest: SkillsManifest | null = null

export async function getSkillsManifest(): Promise<SkillsManifest> {
  if (cachedManifest) return cachedManifest

  try {
    const res = await fetch('/skills-manifest.json')
    if (!res.ok) throw new Error('Failed to fetch manifest')
    cachedManifest = await res.json()
    return cachedManifest!
  } catch (e) {
    console.error('Failed to load skills manifest:', e)
    return { skills: [], categories: ['全部'], generatedAt: '' }
  }
}

export async function getSkills(): Promise<Skill[]> {
  const manifest = await getSkillsManifest()
  return manifest.skills
}

export async function getCategories(): Promise<string[]> {
  const manifest = await getSkillsManifest()
  return manifest.categories
}

export const statusConfig: Record<string, { label: string; color: string; dotBg: string }> = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dotBg: '#10b981' },
  draft: { label: 'Draft', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dotBg: '#f59e0b' },
  deprecated: { label: 'Deprecated', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dotBg: '#ef4444' },
  recommended: { label: 'Recommended', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', dotBg: '#3b82f6' },
}

// Default export for static usage (will be empty until manifest loads)
export const skills: Skill[] = []

export const categories: string[] = ['全部']
