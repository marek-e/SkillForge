import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Connector, DetectionResult, ImportResult } from '../types'
import type { GeminiCliSkill } from '@skillforge/core'
import { exists, listSkillsFromDir } from '../utils'

export async function listGeminiCliSkills(): Promise<GeminiCliSkill[]> {
  const skillsDir = join(homedir(), '.gemini', 'skills')

  const skills = await listSkillsFromDir<GeminiCliSkill>(
    skillsDir,
    (name, frontmatter, filePath) => ({
      name: frontmatter['name'] || name,
      description: frontmatter['description'] || 'Skill',
      filePath,
    }),
  )

  return skills.sort((a, b) => a.name.localeCompare(b.name))
}

export const geminiCliConnector: Connector = {
  name: 'gemini-cli',

  async detect(projectPath?: string): Promise<DetectionResult> {
    const paths: DetectionResult['paths'] = {}
    let detected = false

    const globalDir = join(homedir(), '.gemini')
    if (await exists(globalDir)) {
      paths.globalDir = globalDir
      detected = true
    }

    if (projectPath) {
      const projectDir = join(projectPath, '.gemini')
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
