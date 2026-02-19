import type { CreateSkill, Skill } from '@skillforge/core'
import { fetchApi, mutateApi } from './http'

export const skillsApi = {
  list: () => fetchApi<Skill[]>('/skills'),
  get: (id: string) => fetchApi<Skill>(`/skills/${id}`),
  create: (data: CreateSkill) => mutateApi<Skill>('/skills', { method: 'POST', body: data }),
}
