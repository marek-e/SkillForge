import { access } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Connector, DetectionResult, ImportResult } from '../types'

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

export const claudeCodeConnector: Connector = {
  name: 'claude-code',

  async detect(projectPath?: string): Promise<DetectionResult> {
    const paths: DetectionResult['paths'] = {}
    let detected = false

    // Check for global ~/.claude directory
    const globalDir = join(homedir(), '.claude')
    if (await exists(globalDir)) {
      paths.globalDir = globalDir
      detected = true
    }

    // Check for project-level files if projectPath is provided
    if (projectPath) {
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
