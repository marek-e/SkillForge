import { readdir, readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, basename } from 'node:path'
import type {
  Connector,
  GlobalDetectionResult,
  ProjectDetectionResult,
  ImportResult,
} from '../types'
import type { ClaudeCodeCommand, ClaudeCodeSkill } from '@skillforge/core'
import { exists, parseFrontmatter, listSkillsFromDir } from '../utils'

export async function listGlobalCommands(): Promise<ClaudeCodeCommand[]> {
  const commandsDir = join(homedir(), '.claude', 'commands')
  if (!(await exists(commandsDir))) {
    return []
  }

  const files = await readdir(commandsDir)
  const commands: ClaudeCodeCommand[] = []

  for (const file of files) {
    if (!file.endsWith('.md')) continue

    const filePath = join(commandsDir, file)
    const content = await readFile(filePath, 'utf-8')
    const { frontmatter } = parseFrontmatter(content)

    const name = basename(file, '.md')
    commands.push({
      name,
      description: frontmatter['description'] ?? 'Custom command',
      allowedTools: frontmatter['allowed-tools'],
      argumentHint: frontmatter['argument-hint'],
      filePath,
    })
  }

  return commands.sort((a, b) => a.name.localeCompare(b.name))
}

function extraFrontmatter(frontmatter: Record<string, string>): Record<string, string> | undefined {
  const { name: _n, description: _d, ...rest } = frontmatter
  return Object.keys(rest).length > 0 ? rest : undefined
}

export async function listGlobalSkills(): Promise<ClaudeCodeSkill[]> {
  const skillsDir = join(homedir(), '.claude', 'skills')
  const skills = await listSkillsFromDir(skillsDir, (name, frontmatter, filePath, body) => ({
    name,
    description: frontmatter['description'] ?? 'Skill',
    filePath,
    body,
    frontmatter: extraFrontmatter(frontmatter),
  }))
  return skills.sort((a, b) => a.name.localeCompare(b.name))
}

export async function listProjectClaudeCodeSkills(projectPath: string): Promise<ClaudeCodeSkill[]> {
  const skillsDir = join(projectPath, '.claude', 'skills')
  const skills = await listSkillsFromDir(skillsDir, (name, frontmatter, filePath, body) => ({
    name,
    description: frontmatter['description'] ?? 'Skill',
    filePath,
    body,
    frontmatter: extraFrontmatter(frontmatter),
  }))
  return skills.sort((a, b) => a.name.localeCompare(b.name))
}

export const claudeCodeConnector: Connector = {
  name: 'claude-code',

  async detectGlobal(): Promise<GlobalDetectionResult> {
    const globalDir = join(homedir(), '.claude')
    if (await exists(globalDir)) {
      return { detected: true, globalDir }
    }
    return { detected: false }
  },

  async detectProject(projectPath: string): Promise<ProjectDetectionResult> {
    const paths: ProjectDetectionResult['paths'] = {}
    let detected = false

    // Check for CLAUDE.md in project root
    const claudeMd = join(projectPath, 'CLAUDE.md')
    if (await exists(claudeMd)) {
      paths.projectConfig = claudeMd
      detected = true
    }

    // Check for .claude/ project directory
    const projectClaudeDir = join(projectPath, '.claude')
    if (await exists(projectClaudeDir)) {
      paths.projectDir = projectClaudeDir
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
