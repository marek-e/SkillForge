#!/usr/bin/env node
/**
 * Builds the UI without `VITE_VISUAL_GALLERY` and asserts that no gallery code
 * reaches the shipped bundle. The marker is the `data-gallery-section`
 * attribute, which only the test-only gallery emits.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const uiRoot = path.resolve(import.meta.dirname, '..')
const distDir = path.join(uiRoot, 'dist')
const MARKERS = ['data-gallery-section', 'data-gallery-case', 'gallery /']

const env = { ...process.env }
delete env.VITE_VISUAL_GALLERY

execFileSync('pnpm', ['exec', 'vite', 'build'], { cwd: uiRoot, env, stdio: 'inherit' })

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

const offenders = []
for (const file of walk(distDir)) {
  if (!/\.(js|css|html)$/.test(file)) continue
  const contents = fs.readFileSync(file, 'utf8')
  for (const marker of MARKERS) {
    if (contents.includes(marker)) {
      offenders.push(`${path.relative(uiRoot, file)} contains "${marker}"`)
    }
  }
}

if (offenders.length > 0) {
  console.error('Gallery code leaked into the production build:')
  for (const offender of offenders) console.error(`- ${offender}`)
  process.exit(1)
}

console.log('Production build contains no gallery code.')
