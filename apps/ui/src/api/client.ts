import type {
  Agent,
  CreateProject,
  UpdateProject,
  Project,
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

async function mutateApi<T>(
  endpoint: string,
  options: { method: string; body?: unknown }
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method,
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (!response.ok) {
    const result = await response.json().catch(() => null)
    if (result && 'error' in result && result.error) {
      throw new Error(result.error.message)
    }
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
  projects: {
    list: () => fetchApi<Project[]>('/projects'),
    get: (id: string) => fetchApi<Project>(`/projects/${id}`),
    create: (data: CreateProject) =>
      mutateApi<Project>('/projects', { method: 'POST', body: data }),
    update: (id: string, data: UpdateProject) =>
      mutateApi<Project>(`/projects/${id}`, { method: 'PATCH', body: data }),
    delete: (id: string) =>
      mutateApi<{ success: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
    toggleFavorite: (id: string) =>
      mutateApi<Project>(`/projects/${id}/favorite`, { method: 'PATCH' }),
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
