import { useMemo } from 'react'
import type { CreateSkill } from '@skillforge/core'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/toaster'
import { api, queryKeys } from '@/api/client'

export function useSkills() {
  return useQuery({
    queryKey: queryKeys.skills.lists(),
    queryFn: () => api.skills.list(),
  })
}

export function useAvailableTags(): string[] {
  const { data: skills } = useSkills()
  return useMemo(() => {
    const set = new Set(skills?.flatMap((s) => s.tags) ?? [])
    return [...set].sort()
  }, [skills])
}

export function useCreateSkill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSkill) => api.skills.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.lists() })
      toast.success({ title: 'Skill created' })
    },
    onError: () => toast.error({ title: 'Failed to create skill' }),
  })
}
