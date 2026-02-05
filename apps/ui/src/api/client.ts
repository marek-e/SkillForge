import type { Agent, Skill, HealthResponse, ApiResult } from "@skillforge/core";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4321/api";

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  const result: ApiResult<T> = await response.json();
  if ("error" in result && result.error) {
    throw new Error(result.error.message);
  }
  return result.data as T;
}

export const api = {
  health: () => fetchApi<HealthResponse>("/health"),
  agents: {
    list: () => fetchApi<Agent[]>("/agents"),
    get: (id: string) => fetchApi<Agent>(`/agents/${id}`),
  },
  skills: {
    list: () => fetchApi<Skill[]>("/skills"),
    get: (id: string) => fetchApi<Skill>(`/skills/${id}`),
  },
};
