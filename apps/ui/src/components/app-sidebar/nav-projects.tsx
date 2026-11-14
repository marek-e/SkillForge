import * as stylex from '@stylexjs/stylex'
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

const styles = stylex.create({
  group: { marginTop: '0.25rem' },
  menu: { gap: '0.25rem' },
})

export function NavProjects() {
  const location = useLocation()
  const { data: projects } = useProjects()
  const favorites = projects?.filter((p) => p.isFavorite) ?? []

  if (favorites.length === 0) return null

  return (
    <SidebarGroup sx={styles.group}>
      <SidebarGroupLabel>Favorites</SidebarGroupLabel>
      <SidebarMenu sx={styles.menu}>
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
