// BasePath-aware resource URL helper
// Handles local dev, static export, and GitHub Pages scenarios

const BASE_PATH = process.env.NODE_ENV === 'production' ? '/skills-repo' : ''

export function getResourceUrl(path: string): string {
  if (!path) return ''
  return `${BASE_PATH}${path}`
}

export function getDocsUrl(slug: string): string {
  return getResourceUrl(`/docs/${slug}.md`)
}

export function getEvaluationUrl(slug: string): string {
  return getResourceUrl(`/evaluations/${slug}.md`)
}
