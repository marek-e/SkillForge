import { useQuery } from '@tanstack/react-query'
import { api, queryKeys } from '@/api/client'

export function useHomeData() {
  const { data: tools, isLoading: toolsLoading } = useQuery({
    queryKey: queryKeys.tools.lists(),
    queryFn: api.tools.list,
  })

  const { data: skills, isLoading: skillsLoading } = useQuery({
    queryKey: queryKeys.skills.lists(),
    queryFn: api.skills.list,
  })

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: queryKeys.projects.lists(),
    queryFn: api.projects.list,
  })

  const connectedTools = tools?.filter((t) => t.detected) ?? []
  const totalSkills = skills?.length ?? 0
  const totalProjects = projects?.length ?? 0
  const recentSkills = skills?.slice(0, 5) ?? []
  const recentProjects =
    projects
      ?.slice()
      .sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
      .slice(0, 5) ?? []

  return {
    connectedTools,
    totalSkills,
    totalProjects,
    recentSkills,
    recentProjects,
    isLoading: toolsLoading || skillsLoading || projectsLoading,
    toolsLoading,
    skillsLoading,
    projectsLoading,
  }
}
