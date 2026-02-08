import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Connector, DetectionResult, ImportResult } from '../types'
import type { CursorSkill } from '@skillforge/core'
import { exists, listSkillsFromDir } from '../utils'

async function listSkillsFromCursorDir(
  skillsDir: string,
  isBuiltIn: boolean,
): Promise<CursorSkill[]> {
  return listSkillsFromDir(skillsDir, (name, frontmatter, filePath) => ({
    name: frontmatter['name'] || name,
    description: frontmatter['description'] || 'Skill',
    filePath,
    isBuiltIn,
  }))
}

export async function listCursorSkills(): Promise<CursorSkill[]> {
  const cursorDir = homedir()

  // User skills from ~/.cursor/skills/
  const userSkills = await listSkillsFromCursorDir(join(cursorDir, '.cursor', 'skills'), false)

  // Built-in skills from ~/.cursor/skills-cursor/
  const builtInSkills = await listSkillsFromCursorDir(
    join(cursorDir, '.cursor', 'skills-cursor'),
    true,
  )

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
