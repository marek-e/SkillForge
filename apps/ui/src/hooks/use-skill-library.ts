import { useQuery } from '@tanstack/react-query'
import { api, queryKeys } from '@/api/client'

export function useSkills() {
  return useQuery({
    queryKey: queryKeys.skills.lists(),
    queryFn: () => api.skills.list(),
  })
}
