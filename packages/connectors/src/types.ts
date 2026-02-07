import type { Agent, Skill } from '@skillforge/core'

export interface DetectionResult {
  detected: boolean
  paths: {
    globalDir?: string
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
  detect(projectPath?: string): Promise<DetectionResult>
  import(projectPath?: string): Promise<ImportResult>
  export(agents: Agent[], skills: Skill[], projectPath?: string): Promise<void>
}
