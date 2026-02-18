import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/toaster'
import { api, queryKeys } from '@/api/client'

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => api.projects.get(projectId),
  })
}

export function useRenameProject(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string }) => api.projects.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) })
    },
    onError: () => toast.error({ title: 'Failed to rename project' }),
  })
}

export function useUpdateProjectIcon(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { iconPath: string | null }) => api.projects.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) })
      toast.success({ title: 'Icon path saved' })
    },
    onError: () => toast.error({ title: 'Failed to save icon path' }),
  })
}

export function useRefreshProjectTools(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.projects.refreshTools(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() })
    },
    onError: () => toast.error({ title: 'Failed to refresh tools' }),
  })
}

export function useToggleFavoriteProject(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.projects.toggleFavorite(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) })
    },
    onError: () => toast.error({ title: 'Failed to update favorite' }),
  })
}

export function useDeleteProject(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.projects.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) })
      toast.success({ title: 'Project deleted' })
    },
    onError: () => toast.error({ title: 'Failed to delete project' }),
  })
}
