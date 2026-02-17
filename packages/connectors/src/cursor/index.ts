import { homedir } from 'node:os'
import { join } from 'node:path'
import type {
  Connector,
  GlobalDetectionResult,
  ProjectDetectionResult,
  ImportResult,
} from '../types'
import type { CursorSkill } from '@skillforge/core'
import { exists, listSkillsFromDir } from '../utils'

async function listSkillsFromCursorDir(
  skillsDir: string,
  isBuiltIn: boolean
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
    true
  )

  const allSkills = [...builtInSkills, ...userSkills]
  return allSkills.sort((a, b) => a.name.localeCompare(b.name))
}

export const cursorConnector: Connector = {
  name: 'cursor',

  async detectGlobal(): Promise<GlobalDetectionResult> {
    const globalDir = join(homedir(), '.cursor')
    if (await exists(globalDir)) {
      return { detected: true, globalDir }
    }
    return { detected: false }
  },

  async detectProject(projectPath: string): Promise<ProjectDetectionResult> {
    const paths: ProjectDetectionResult['paths'] = {}
    let detected = false

    const cursorRules = join(projectPath, '.cursor')
    if (await exists(cursorRules)) {
      paths.projectConfig = cursorRules
      detected = true
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
