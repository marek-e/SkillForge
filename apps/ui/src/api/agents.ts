import type { Agent } from '@skillforge/core'
import { fetchApi } from './http'

export const agentsApi = {
  list: () => fetchApi<Agent[]>('/agents'),
  get: (id: string) => fetchApi<Agent>(`/agents/${id}`),
}
