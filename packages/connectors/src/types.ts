import type { Agent, Skill } from '@skillforge/core'

export interface GlobalDetectionResult {
  detected: boolean
  globalDir?: string
}

export interface ProjectDetectionResult {
  detected: boolean
  paths: {
    projectConfig?: string
    projectDir?: string
  }
}

export interface ImportResult {
  agents: Agent[]
  skills: Skill[]
  warnings?: string[]
}

export interface Connector {
  name: string
  detectGlobal(): Promise<GlobalDetectionResult>
  detectProject(projectPath: string): Promise<ProjectDetectionResult>
  import(projectPath?: string): Promise<ImportResult>
  export(agents: Agent[], skills: Skill[], projectPath?: string): Promise<void>
}
