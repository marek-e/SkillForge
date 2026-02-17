import { useState, useEffect } from 'react'
import { createRoute, Link } from '@tanstack/react-router'
import { ArrowLeftIcon, PencilIcon } from 'lucide-react'
import { rootRoute } from './__root'
import {
  useProject,
  useRenameProject,
  useUpdateProjectIcon,
  useRefreshProjectTools,
} from '@/hooks/use-project-detail'
import { ErrorContainer } from '@/components/ErrorContainer'
import { H1 } from '@/components/typography'
import { getProjectIconSource } from '@/lib/project-icon'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { RenameProjectDialog } from '@/components/project-detail/RenameProjectDialog'
import { ProjectIconForm } from '@/components/project-detail/ProjectIconForm'
import { DetectedToolsList } from '@/components/project-detail/DetectedToolsList'

export const projectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId',
  component: ProjectDetailPage,
})

function ProjectDetailPage() {
  const { projectId } = projectDetailRoute.useParams()

  const { data: project, isLoading, error } = useProject(projectId)
  const renameMutation = useRenameProject(projectId)
  const updateIconMutation = useUpdateProjectIcon(projectId)
  const refreshToolsMutation = useRefreshProjectTools(projectId)

  const [renameOpen, setRenameOpen] = useState(false)
  const [renameDraft, setRenameDraft] = useState('')
  const [iconPath, setIconPath] = useState('')

  useEffect(() => {
    if (project) {
      setIconPath(project.iconPath ?? '')
    }
  }, [project])

  function handleRename() {
    const trimmed = renameDraft.trim()
    if (!trimmed) return
    renameMutation.mutate({ name: trimmed }, { onSuccess: () => setRenameOpen(false) })
  }

  if (error) {
    return (
      <ErrorContainer
        title="Failed to load project"
        message={error.message}
        backTo="/projects"
        backLabel="Back to projects"
      />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back to projects
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarImage
              src={getProjectIconSource(project.iconPath, project.path)}
              alt={project.name}
            />
            <AvatarFallback>{project.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <H1>{project.name}</H1>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                setRenameDraft(project.name)
                setRenameOpen(true)
              }}
            >
              <PencilIcon className="size-4" />
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground font-mono text-sm ml-[52px]">{project.path}</p>
      </div>

      <RenameProjectDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        name={renameDraft}
        onNameChange={setRenameDraft}
        onSubmit={handleRename}
        isPending={renameMutation.isPending}
      />

      <ProjectIconForm
        iconPath={iconPath}
        onIconPathChange={setIconPath}
        onSave={() => updateIconMutation.mutate({ iconPath: iconPath.trim() || null })}
        isPending={updateIconMutation.isPending}
      />

      <DetectedToolsList
        tools={project.detectedTools.filter((t) => t.detected)}
        onRefresh={() => refreshToolsMutation.mutate()}
        isRefreshing={refreshToolsMutation.isPending}
      />
    </div>
  )
}
