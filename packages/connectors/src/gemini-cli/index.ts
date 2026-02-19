import { homedir } from 'node:os'
import { join } from 'node:path'
import type {
  Connector,
  GlobalDetectionResult,
  ProjectDetectionResult,
  ImportResult,
} from '../types'
import type { GeminiCliSkill } from '@skillforge/core'
import { exists, listSkillsFromDir } from '../utils'

function extraFrontmatter(frontmatter: Record<string, string>): Record<string, string> | undefined {
  const { name: _n, description: _d, ...rest } = frontmatter
  return Object.keys(rest).length > 0 ? rest : undefined
}

export async function listProjectGeminiCliSkills(projectPath: string): Promise<GeminiCliSkill[]> {
  const skills = await listSkillsFromDir<GeminiCliSkill>(
    join(projectPath, '.gemini', 'skills'),
    (name, frontmatter, filePath, body) => ({
      name: frontmatter['name'] || name,
      description: frontmatter['description'] || 'Skill',
      filePath,
      body,
      frontmatter: extraFrontmatter(frontmatter),
    })
  )
  return skills.sort((a, b) => a.name.localeCompare(b.name))
}

export async function listGeminiCliSkills(): Promise<GeminiCliSkill[]> {
  const skillsDir = join(homedir(), '.gemini', 'skills')

  const skills = await listSkillsFromDir<GeminiCliSkill>(
    skillsDir,
    (name, frontmatter, filePath, body) => ({
      name: frontmatter['name'] || name,
      description: frontmatter['description'] || 'Skill',
      filePath,
      body,
      frontmatter: extraFrontmatter(frontmatter),
    })
  )

  return skills.sort((a, b) => a.name.localeCompare(b.name))
}

export const geminiCliConnector: Connector = {
  name: 'gemini-cli',

  async detectGlobal(): Promise<GlobalDetectionResult> {
    const globalDir = join(homedir(), '.gemini')
    if (await exists(globalDir)) {
      return { detected: true, globalDir }
    }
    return { detected: false }
  },

  async detectProject(projectPath: string): Promise<ProjectDetectionResult> {
    const paths: ProjectDetectionResult['paths'] = {}
    let detected = false

    const projectDir = join(projectPath, '.gemini')
    if (await exists(projectDir)) {
      paths.projectDir = projectDir
      detected = true
    }

    return { detected, paths }
  },

  async import(_projectPath?: string): Promise<ImportResult> {
    return { agents: [], skills: [] }
  },

  async export(_agents, _skills, _projectPath?: string): Promise<void> {},
}
