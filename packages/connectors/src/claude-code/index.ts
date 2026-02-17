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
import { exists } from '../utils'

function parseFrontmatter(content: string): { frontmatter: Record<string, string>; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    return { frontmatter: {}, body: content }
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

  return { frontmatter, body: match[2] }
}

function extractFirstLine(content: string): string {
  const lines = content.trim().split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      return trimmed.slice(0, 100)
    }
    if (trimmed.startsWith('# ')) {
      return trimmed.slice(2).slice(0, 100)
    }
  }
  return ''
}

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
    const { frontmatter, body } = parseFrontmatter(content)

    const name = basename(file, '.md')
    commands.push({
      name,
      description: frontmatter['description'] || extractFirstLine(body) || 'Custom command',
      allowedTools: frontmatter['allowed-tools'],
      argumentHint: frontmatter['argument-hint'],
      filePath,
    })
  }

  return commands.sort((a, b) => a.name.localeCompare(b.name))
}

export async function listGlobalSkills(): Promise<ClaudeCodeSkill[]> {
  const skillsDir = join(homedir(), '.claude', 'skills')
  if (!(await exists(skillsDir))) {
    return []
  }

  const entries = await readdir(skillsDir, { withFileTypes: true })
  const skills: ClaudeCodeSkill[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const skillMdPath = join(skillsDir, entry.name, 'SKILL.md')
    if (!(await exists(skillMdPath))) continue

    const content = await readFile(skillMdPath, 'utf-8')
    const description = extractFirstLine(content)

    skills.push({
      name: entry.name,
      description: description || 'Skill',
      filePath: skillMdPath,
    })
  }

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
