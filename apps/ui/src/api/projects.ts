import type { CreateProject, Project, UpdateProject } from '@skillforge/core'
import { fetchApi, mutateApi } from './http'

export const projectsApi = {
  list: () => fetchApi<Project[]>('/projects'),
  get: (id: string) => fetchApi<Project>(`/projects/${id}`),
  create: (data: CreateProject) => mutateApi<Project>('/projects', { method: 'POST', body: data }),
  update: (id: string, data: UpdateProject) =>
    mutateApi<Project>(`/projects/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => mutateApi<{ success: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
  toggleFavorite: (id: string) =>
    mutateApi<Project>(`/projects/${id}/favorite`, { method: 'PATCH' }),
  refreshTools: (id: string) =>
    mutateApi<Project>(`/projects/${id}/refresh-tools`, { method: 'POST' }),
}
