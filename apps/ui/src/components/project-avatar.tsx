import type { Project } from '@skillforge/core'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getProjectIconSource } from '@/lib/project-icon'

interface ProjectAvatarProps {
  project: Pick<Project, 'iconPath' | 'path' | 'name'>
  size?: 'xs' | 'sm' | 'default' | 'lg'
}

export function ProjectAvatar({ project, size = 'default' }: ProjectAvatarProps) {
  const hasCustomIcon = Boolean(project.iconPath?.trim())

  if (hasCustomIcon) {
    return (
      <Avatar size={size} className="rounded-none after:border-0 after:rounded-none">
        <AvatarImage
          src={getProjectIconSource(project.iconPath, project.path)}
          alt={project.name}
          className="rounded-none"
        />
        <AvatarFallback className="rounded-none">
          {project.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <Avatar size={size} className="rounded-lg after:rounded-lg">
      <AvatarImage
        src={getProjectIconSource(project.iconPath, project.path)}
        alt={project.name}
        className="rounded-lg"
      />
      <AvatarFallback className="rounded-lg">{project.name.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}
