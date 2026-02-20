export interface ApiResponse<T> {
  data: T
  error?: never
}

export interface ApiError {
  data?: never
  error: {
    message: string
    code: string
  }
}

export type ApiResult<T> = ApiResponse<T> | ApiError

export interface HealthResponse {
  status: 'ok'
  version: string
  timestamp: string
}

export interface ToolStatus {
  name: string
  detected: boolean
  paths: { globalDir?: string; projectDir?: string }
  commandCount: number
  skillCount: number
}

export interface ClaudeCodeCommand {
  name: string
  description: string
  allowedTools?: string
  argumentHint?: string
  filePath: string
}

export interface ClaudeCodeSkill {
  name: string
  description: string
  filePath: string
  body?: string
  frontmatter?: Record<string, string>
}

export interface CursorSkill {
  name: string
  description: string
  filePath: string
  isBuiltIn: boolean
  body?: string
  frontmatter?: Record<string, string>
}

export interface CodexSkill {
  name: string
  description: string
  filePath: string
  body?: string
  frontmatter?: Record<string, string>
}

export interface GeminiCliSkill {
  name: string
  description: string
  filePath: string
  body?: string
  frontmatter?: Record<string, string>
}

export interface OpenCodeSkill {
  name: string
  description: string
  filePath: string
  body?: string
  frontmatter?: Record<string, string>
}

export interface CopilotSkill {
  name: string
  description: string
  filePath: string
  body?: string
  frontmatter?: Record<string, string>
}

export interface VibeSkill {
  name: string
  description: string
  filePath: string
  body?: string
  frontmatter?: Record<string, string>
}

export type SkillItem =
  | ClaudeCodeSkill
  | CursorSkill
  | CodexSkill
  | GeminiCliSkill
  | OpenCodeSkill
  | CopilotSkill
  | VibeSkill
