import { homedir } from 'node:os'
import { join } from 'node:path'
import type {
  Connector,
  GlobalDetectionResult,
  ProjectDetectionResult,
  ImportResult,
} from '../types'
import type { VibeSkill } from '@skillforge/core'
import { exists, listSkillsFromDir } from '../utils'

function extraFrontmatter(frontmatter: Record<string, string>): Record<string, string> | undefined {
  const { name: _n, description: _d, ...rest } = frontmatter
  return Object.keys(rest).length > 0 ? rest : undefined
}

export async function listProjectVibeSkills(projectPath: string): Promise<VibeSkill[]> {
  const skills = await listSkillsFromDir<VibeSkill>(
    join(projectPath, '.vibe', 'skills'),
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

export async function listVibeSkills(): Promise<VibeSkill[]> {
  const skillsDir = join(homedir(), '.vibe', 'skills')

  const skills = await listSkillsFromDir<VibeSkill>(
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

export const vibeConnector: Connector = {
  name: 'vibe',

  async detectGlobal(): Promise<GlobalDetectionResult> {
    const globalDir = join(homedir(), '.vibe')
    if (await exists(globalDir)) {
      return { detected: true, globalDir }
    }
    return { detected: false }
  },

  async detectProject(projectPath: string): Promise<ProjectDetectionResult> {
    const paths: ProjectDetectionResult['paths'] = {}
    let detected = false

    const projectDir = join(projectPath, '.vibe')
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
