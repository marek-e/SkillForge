import type {
  Agent,
  Skill,
  HealthResponse,
  ApiResult,
  ToolStatus,
  ClaudeCodeCommand,
  ClaudeCodeSkill,
  CursorSkill,
  CodexSkill,
  GeminiCliSkill,
  OpenCodeSkill,
} from '@skillforge/core'

function getApiBase(): string {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  if (typeof window !== 'undefined' && window.location?.protocol === 'skillforge:') {
    return `${window.location.origin}/api`
  }
  return 'http://localhost:4321/api'
}
const API_BASE = getApiBase()

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`)
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }
  const result: ApiResult<T> = await response.json()
  if ('error' in result && result.error) {
    throw new Error(result.error.message)
  }
  return result.data as T
}

export const api = {
  health: () => fetchApi<HealthResponse>('/health'),
  agents: {
    list: () => fetchApi<Agent[]>('/agents'),
    get: (id: string) => fetchApi<Agent>(`/agents/${id}`),
  },
  skills: {
    list: () => fetchApi<Skill[]>('/skills'),
    get: (id: string) => fetchApi<Skill>(`/skills/${id}`),
  },
  tools: {
    list: () => fetchApi<ToolStatus[]>('/tools'),
    claudeCodeCommands: () => fetchApi<ClaudeCodeCommand[]>('/tools/claude-code/commands'),
    claudeCodeSkills: () => fetchApi<ClaudeCodeSkill[]>('/tools/claude-code/skills'),
    cursorSkills: () => fetchApi<CursorSkill[]>('/tools/cursor/skills'),
    codexSkills: () => fetchApi<CodexSkill[]>('/tools/codex/skills'),
    geminiCliSkills: () => fetchApi<GeminiCliSkill[]>('/tools/gemini-cli/skills'),
    openCodeSkills: () => fetchApi<OpenCodeSkill[]>('/tools/opencode/skills'),
  },
}
