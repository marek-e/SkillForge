import * as stylex from '@stylexjs/stylex'
import { radius } from '@/styles/tokens.stylex'
import type { Project } from '@skillforge/core'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getProjectIconSource } from '@/lib/project-icon'

const styles = stylex.create({
  customRoot: {
    borderRadius: '0',
    '::after': { borderWidth: '0px', borderRadius: '0' },
  },
  customImage: { borderRadius: '0' },
  defaultRoot: { borderRadius: radius.lg, '::after': { borderRadius: radius.lg } },
  defaultImage: { borderRadius: radius.lg },
})

interface ProjectAvatarProps {
  project: Pick<Project, 'iconPath' | 'path' | 'name'>
  size?: 'xs' | 'sm' | 'default' | 'lg'
}

export function ProjectAvatar({ project, size = 'default' }: ProjectAvatarProps) {
  const hasCustomIcon = Boolean(project.iconPath?.trim())

  if (hasCustomIcon) {
    return (
      <Avatar size={size} sx={styles.customRoot}>
        <AvatarImage
          src={getProjectIconSource(project.iconPath, project.path)}
          alt={project.name}
          sx={styles.customImage}
        />
        <AvatarFallback sx={styles.customImage}>
          {project.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <Avatar size={size} sx={styles.defaultRoot}>
      <AvatarImage
        src={getProjectIconSource(project.iconPath, project.path)}
        alt={project.name}
        sx={styles.defaultImage}
      />
      <AvatarFallback sx={styles.defaultImage}>
        {project.name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}
