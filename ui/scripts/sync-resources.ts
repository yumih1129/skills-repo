import * as fs from 'fs'
import * as path from 'path'

const REPO_ROOT = path.resolve(__dirname, '../..')
const DOCS_DIR = path.join(REPO_ROOT, 'docs')
const EVALS_DIR = path.join(REPO_ROOT, 'evaluations')
const PUBLIC_DOCS_DIR = path.join(__dirname, '../public/docs')
const PUBLIC_EVALS_DIR = path.join(__dirname, '../public/evaluations')

function copyDir(src: string, dest: string, label: string, extension: string = '.md') {
  if (!fs.existsSync(src)) {
    console.warn(`[sync] source not found: ${src}`)
    return
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const files = fs.readdirSync(src).filter(f => f.endsWith(extension))
  const destFiles = fs.readdirSync(dest).filter(f => f.endsWith(extension))
  const srcFiles = new Set(files)

  let count = 0

  for (const file of files) {
    fs.copyFileSync(path.join(src, file), path.join(dest, file))
    count++
  }

  for (const file of destFiles) {
    if (!srcFiles.has(file)) {
      fs.unlinkSync(path.join(dest, file))
    }
  }

  if (count > 0) {
    console.log(`[sync] ${label}: ${count} file(s)`)
  }
}

export function syncResources() {
  copyDir(DOCS_DIR, PUBLIC_DOCS_DIR, 'docs')
  copyDir(EVALS_DIR, PUBLIC_EVALS_DIR, 'evaluations')
}
