import type { CreateSkill, Skill } from '@skillforge/core'
import { fetchApi, mutateApi } from './http'

export const skillsApi = {
  list: () => fetchApi<Skill[]>('/skills'),
  get: (id: string) => fetchApi<Skill>(`/skills/${id}`),
  create: (data: CreateSkill) => mutateApi<Skill>('/skills', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Pick<Skill, 'name' | 'description' | 'body' | 'tags' | 'scope'>>) =>
    mutateApi<Skill>(`/skills/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => mutateApi<{ success: boolean }>(`/skills/${id}`, { method: 'DELETE' }),
  getContent: (id: string) => fetchApi<{ content: string }>(`/skills/${id}/content`),
  updateContent: (id: string, content: string) =>
    mutateApi<{ success: boolean }>(`/skills/${id}/content`, { method: 'PUT', body: { content } }),
  listDirectory: (id: string) =>
    fetchApi<{ directory: string; files: string[] }>(`/skills/${id}/directory`),
  getFile: (id: string, path: string) =>
    fetchApi<{ content: string }>(`/skills/${id}/file?path=${encodeURIComponent(path)}`),
  updateFile: (id: string, path: string, content: string) =>
    mutateApi<{ success: boolean }>(`/skills/${id}/file?path=${encodeURIComponent(path)}`, {
      method: 'PUT',
      body: { content },
    }),
}
