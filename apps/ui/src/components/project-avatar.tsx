import type { Project } from '@skillforge/core'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getProjectIconSource } from '@/lib/project-icon'

interface ProjectAvatarProps {
  project: Pick<Project, 'iconPath' | 'path' | 'name'>
  size?: 'xs' | 'sm' | 'default' | 'lg'
}

export function ProjectAvatar({ project, size = 'default' }: ProjectAvatarProps) {
  return (
    <Avatar size={size}>
      <AvatarImage src={getProjectIconSource(project.iconPath, project.path)} alt={project.name} />
      <AvatarFallback>{project.name.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}
