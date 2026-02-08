import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Connector, DetectionResult, ImportResult } from '../types'
import type { CodexSkill } from '@skillforge/core'
import { exists, listSkillsFromDir } from '../utils'

export async function listCodexSkills(): Promise<CodexSkill[]> {
  const skillsDir = join(homedir(), '.agents', 'skills')

  const skills = await listSkillsFromDir<CodexSkill>(
    skillsDir,
    (name, frontmatter, filePath) => ({
      name: frontmatter['name'] || name,
      description: frontmatter['description'] || 'Skill',
      filePath,
    }),
  )

  return skills.sort((a, b) => a.name.localeCompare(b.name))
}

export const codexConnector: Connector = {
  name: 'codex',

  async detect(projectPath?: string): Promise<DetectionResult> {
    const paths: DetectionResult['paths'] = {}
    let detected = false

    const globalDir = join(homedir(), '.agents')
    if (await exists(globalDir)) {
      paths.globalDir = globalDir
      detected = true
    }

    if (projectPath) {
      const projectDir = join(projectPath, '.agents')
      if (await exists(projectDir)) {
        paths.projectDir = projectDir
        detected = true
      }
    }

    return { detected, paths }
  },

  async import(_projectPath?: string): Promise<ImportResult> {
    return { agents: [], skills: [] }
  },

  async export(_agents, _skills, _projectPath?: string): Promise<void> {},
}
