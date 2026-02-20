import type {
  ClaudeCodeCommand,
  ClaudeCodeSkill,
  CodexSkill,
  CopilotSkill,
  CursorSkill,
  GeminiCliSkill,
  OpenCodeSkill,
  ToolStatus,
  VibeSkill,
} from '@skillforge/core'
import { fetchApi } from './http'

export const toolsApi = {
  list: () => fetchApi<ToolStatus[]>('/tools'),
  claudeCodeCommands: () => fetchApi<ClaudeCodeCommand[]>('/tools/claude-code/commands'),
  claudeCodeSkills: () => fetchApi<ClaudeCodeSkill[]>('/tools/claude-code/skills'),
  cursorSkills: () => fetchApi<CursorSkill[]>('/tools/cursor/skills'),
  codexSkills: () => fetchApi<CodexSkill[]>('/tools/codex/skills'),
  geminiCliSkills: () => fetchApi<GeminiCliSkill[]>('/tools/gemini-cli/skills'),
  openCodeSkills: () => fetchApi<OpenCodeSkill[]>('/tools/opencode/skills'),
  copilotSkills: () => fetchApi<CopilotSkill[]>('/tools/copilot/skills'),
  vibeSkills: () => fetchApi<VibeSkill[]>('/tools/vibe/skills'),
}
