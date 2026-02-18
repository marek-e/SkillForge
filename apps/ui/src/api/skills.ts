import type { Skill } from '@skillforge/core'
import { fetchApi } from './http'

export const skillsApi = {
  list: () => fetchApi<Skill[]>('/skills'),
  get: (id: string) => fetchApi<Skill>(`/skills/${id}`),
}
