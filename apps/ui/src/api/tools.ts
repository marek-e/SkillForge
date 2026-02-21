import type {
  ClaudeCodeCommand,
  ClaudeCodeSkill,
  CodexSkill,
  DefaultSkill,
  CursorSkill,
  ToolStatus,
} from '@skillforge/core'
import { fetchApi } from './http'

export const toolsApi = {
  list: () => fetchApi<ToolStatus[]>('/tools'),
  claudeCodeCommands: () => fetchApi<ClaudeCodeCommand[]>('/tools/claude-code/commands'),
  claudeCodeSkills: () => fetchApi<ClaudeCodeSkill[]>('/tools/claude-code/skills'),
  cursorSkills: () => fetchApi<CursorSkill[]>('/tools/cursor/skills'),
  codexSkills: () => fetchApi<CodexSkill[]>('/tools/codex/skills'),
  geminiCliSkills: () => fetchApi<DefaultSkill[]>('/tools/gemini-cli/skills'),
  openCodeSkills: () => fetchApi<DefaultSkill[]>('/tools/opencode/skills'),
  copilotSkills: () => fetchApi<DefaultSkill[]>('/tools/copilot/skills'),
  vibeSkills: () => fetchApi<DefaultSkill[]>('/tools/vibe/skills'),
}
