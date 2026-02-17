import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/api/client'

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => api.projects.get(projectId),
  })
}

export function useRenameProject(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string }) => api.projects.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
    onError: () => toast.error('Failed to rename project'),
  })
}

export function useUpdateProjectIcon(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { iconPath: string | null }) => api.projects.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
      toast.success('Icon path saved')
    },
    onError: () => toast.error('Failed to save icon path'),
  })
}

export function useRefreshProjectTools(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.projects.refreshTools(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: () => toast.error('Failed to refresh tools'),
  })
}

export function useToggleFavoriteProject(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.projects.toggleFavorite(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
    onError: () => toast.error('Failed to update favorite'),
  })
}

export function useDeleteProject(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.projects.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
      toast.success('Project deleted')
    },
    onError: () => toast.error('Failed to delete project'),
  })
}
