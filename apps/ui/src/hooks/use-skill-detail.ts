import type { Skill } from '@skillforge/core'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from '@/components/ui/toaster'
import { api, queryKeys } from '@/api/client'

export function useSkill(skillId: string) {
  return useQuery({
    queryKey: queryKeys.skills.detail(skillId),
    queryFn: () => api.skills.get(skillId),
  })
}

export function useSkillDirectory(skillId: string, implementationRef: string | undefined) {
  return useQuery({
    queryKey: ['skills', 'directory', skillId],
    queryFn: () => api.skills.listDirectory(skillId),
    enabled: !!implementationRef,
    retry: false,
  })
}

export function useSkillFile(skillId: string, path: string | null) {
  return useQuery({
    queryKey: ['skills', 'file', skillId, path],
    queryFn: () => api.skills.getFile(skillId, path!),
    enabled: !!path,
    retry: false,
  })
}

export function useUpdateSkill(skillId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Pick<Skill, 'name' | 'description' | 'body'>>) =>
      api.skills.update(skillId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.skills.detail(skillId) }),
  })
}

export function useUpdateSkillContent(skillId: string) {
  return useMutation({
    mutationFn: (content: string) => api.skills.updateContent(skillId, content),
  })
}

export function useDeleteSkill(skillId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => api.skills.delete(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.lists() })
      toast.success({ title: 'Skill removed from library' })
      navigate({ to: '/skill-library' })
    },
    onError: () => toast.error({ title: 'Failed to remove skill' }),
  })
}
