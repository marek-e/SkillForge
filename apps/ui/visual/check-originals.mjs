#!/usr/bin/env node
/**
 * Guards the frozen originals after a visual run.
 *
 * 1. A `-actual` or `-diff` artifact in `visual/results/` means a comparison
 *    failed or an original was missing. Either way the run is not clean.
 * 2. Every original under `visual/__originals__/` must have been claimed by a
 *    test in the last run (`visual/results/used-originals.log`). An unclaimed
 *    original is an orphan left behind by a renamed or deleted case.
 *
 * The originals themselves are never written here. They are frozen at the
 * pre-migration commit and only a dedicated PR may replace one.
 */
import fs from 'node:fs'
import path from 'node:path'

const here = import.meta.dirname
const originalsDir = path.join(here, '__originals__')
const resultsDir = path.join(here, 'results')
const usedLog = path.join(resultsDir, 'used-originals.log')

const problems = []

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

const artifacts = walk(resultsDir).filter((file) =>
  /-(actual|diff)\.(png|json|txt)$/.test(path.basename(file))
)
if (artifacts.length > 0) {
  problems.push(
    `${artifacts.length} failure artifact(s) in visual/results. The first few:\n` +
      artifacts
        .slice(0, 10)
        .map((file) => `  ${path.relative(here, file)}`)
        .join('\n')
  )
}

const originals = walk(originalsDir)
if (originals.length === 0) {
  problems.push('No originals found under visual/__originals__.')
}

if (!fs.existsSync(usedLog)) {
  problems.push(
    'visual/results/used-originals.log is missing. Run `pnpm visual` before this check.'
  )
} else {
  const used = new Set(
    fs
      .readFileSync(usedLog, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => path.resolve(line))
  )
  const orphans = originals.filter((file) => !used.has(path.resolve(file)))
  if (orphans.length > 0) {
    problems.push(
      `${orphans.length} original(s) were not claimed by any test. The first few:\n` +
        orphans
          .slice(0, 20)
          .map((file) => `  ${path.relative(here, file)}`)
          .join('\n')
    )
  }
  const missing = [...used].filter((file) => !fs.existsSync(file))
  if (missing.length > 0) {
    problems.push(
      `${missing.length} original(s) claimed by a test do not exist:\n` +
        missing
          .slice(0, 20)
          .map((file) => `  ${path.relative(here, file)}`)
          .join('\n')
    )
  }
}

if (problems.length > 0) {
  console.error('Visual originals check failed:\n')
  for (const problem of problems) console.error(`- ${problem}\n`)
  process.exit(1)
}

console.log(`Visual originals check passed (${originals.length} originals).`)
