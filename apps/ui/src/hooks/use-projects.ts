import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from '@/components/ui/toaster'
import { api } from '@/api/client'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: api.projects.list,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: api.projects.create,
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate({
        to: '/projects/$projectId',
        params: { projectId: project.id },
      })
    },
    onError: () => toast.error({ title: 'Failed to add project' }),
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.projects.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success({ title: 'Project deleted' })
    },
    onError: () => toast.error({ title: 'Failed to delete project' }),
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.projects.toggleFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    onError: () => toast.error({ title: 'Failed to update favorite' }),
  })
}
