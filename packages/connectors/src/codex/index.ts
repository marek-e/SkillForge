import { homedir } from 'node:os'
import { join } from 'node:path'
import type {
  Connector,
  GlobalDetectionResult,
  ProjectDetectionResult,
  ImportResult,
} from '../types'
import type { CodexSkill } from '@skillforge/core'
import { exists, listSkillsFromDir } from '../utils'

export async function listCodexSkills(): Promise<CodexSkill[]> {
  const skillsDir = join(homedir(), '.agents', 'skills')

  const skills = await listSkillsFromDir<CodexSkill>(skillsDir, (name, frontmatter, filePath) => ({
    name: frontmatter['name'] || name,
    description: frontmatter['description'] || 'Skill',
    filePath,
  }))

  return skills.sort((a, b) => a.name.localeCompare(b.name))
}

export const codexConnector: Connector = {
  name: 'codex',

  async detectGlobal(): Promise<GlobalDetectionResult> {
    const globalDir = join(homedir(), '.agents')
    if (await exists(globalDir)) {
      return { detected: true, globalDir }
    }
    return { detected: false }
  },

  async detectProject(projectPath: string): Promise<ProjectDetectionResult> {
    const paths: ProjectDetectionResult['paths'] = {}
    let detected = false

    const projectDir = join(projectPath, '.agents')
    if (await exists(projectDir)) {
      paths.projectDir = projectDir
      detected = true
    }
    const codexDir = join(projectPath, '.codex')
    if (await exists(codexDir)) {
      paths.projectDir = codexDir
      detected = true
    }

    return { detected, paths }
  },

  async import(_projectPath?: string): Promise<ImportResult> {
    return { agents: [], skills: [] }
  },

  async export(_agents, _skills, _projectPath?: string): Promise<void> {},
}
