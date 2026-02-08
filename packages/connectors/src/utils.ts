import { access, readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

export async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

export function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) {
    return {}
  }

  const frontmatter: Record<string, string> = {}
  const lines = match[1].split('\n')
  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim()
      const value = line.slice(colonIndex + 1).trim()
      frontmatter[key] = value
    }
  }

  return frontmatter
}

export async function listSkillsFromDir<T>(
  skillsDir: string,
  mapFn: (name: string, frontmatter: Record<string, string>, filePath: string) => T
): Promise<T[]> {
  if (!(await exists(skillsDir))) {
    return []
  }

  const entries = await readdir(skillsDir, { withFileTypes: true })
  const skills: T[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const skillMdPath = join(skillsDir, entry.name, 'SKILL.md')
    if (!(await exists(skillMdPath))) continue

    const content = await readFile(skillMdPath, 'utf-8')
    const frontmatter = parseFrontmatter(content)

    skills.push(mapFn(entry.name, frontmatter, skillMdPath))
  }

  return skills
}
