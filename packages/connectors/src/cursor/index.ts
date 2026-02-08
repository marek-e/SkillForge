import { access, readdir, readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Connector, DetectionResult, ImportResult } from '../types'
import type { CursorSkill } from '@skillforge/core'

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

function parseFrontmatter(content: string): Record<string, string> {
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

async function listSkillsFromDir(skillsDir: string, isBuiltIn: boolean): Promise<CursorSkill[]> {
  if (!(await exists(skillsDir))) {
    return []
  }

  const entries = await readdir(skillsDir, { withFileTypes: true })
  const skills: CursorSkill[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const skillMdPath = join(skillsDir, entry.name, 'SKILL.md')
    if (!(await exists(skillMdPath))) continue

    const content = await readFile(skillMdPath, 'utf-8')
    const frontmatter = parseFrontmatter(content)

    skills.push({
      name: frontmatter['name'] || entry.name,
      description: frontmatter['description'] || 'Skill',
      filePath: skillMdPath,
      isBuiltIn,
    })
  }

  return skills
}

export async function listCursorSkills(): Promise<CursorSkill[]> {
  const cursorDir = homedir()

  // User skills from ~/.cursor/skills/
  const userSkills = await listSkillsFromDir(join(cursorDir, '.cursor', 'skills'), false)

  // Built-in skills from ~/.cursor/skills-cursor/
  const builtInSkills = await listSkillsFromDir(join(cursorDir, '.cursor', 'skills-cursor'), true)

  const allSkills = [...builtInSkills, ...userSkills]
  return allSkills.sort((a, b) => a.name.localeCompare(b.name))
}

export const cursorConnector: Connector = {
  name: 'cursor',

  async detect(projectPath?: string): Promise<DetectionResult> {
    const paths: DetectionResult['paths'] = {}
    let detected = false

    // Check for global ~/.cursor directory
    const globalDir = join(homedir(), '.cursor')
    if (await exists(globalDir)) {
      paths.globalDir = globalDir
      detected = true
    }

    // Check for project-level .cursorrules file
    if (projectPath) {
      const cursorRules = join(projectPath, '.cursorrules')
      if (await exists(cursorRules)) {
        paths.projectConfig = cursorRules
        detected = true
      }
    }

    return { detected, paths }
  },

  async import(_projectPath?: string): Promise<ImportResult> {
    // TODO: Implement import functionality
    return { agents: [], skills: [] }
  },

  async export(_agents, _skills, _projectPath?: string): Promise<void> {
    // TODO: Implement export functionality
  },
}
