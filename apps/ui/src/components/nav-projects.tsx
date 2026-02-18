import { Link, useLocation } from '@tanstack/react-router'
import { useProjects } from '@/hooks/use-projects'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { ProjectAvatar } from '@/components/project-avatar'

export function NavProjects() {
  const location = useLocation()
  const { data: projects } = useProjects()
  const favorites = projects?.filter((p) => p.isFavorite) ?? []

  if (favorites.length === 0) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Favorites</SidebarGroupLabel>
      <SidebarMenu className="gap-1">
        {favorites.map((project) => {
          const isActive = location.pathname === `/projects/${project.id}`
          return (
            <SidebarMenuItem key={project.id}>
              <SidebarMenuButton asChild tooltip={project.name} isActive={isActive}>
                <Link to="/projects/$projectId" params={{ projectId: project.id }}>
                  <ProjectAvatar project={project} size="xs" />
                  <span>{project.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
