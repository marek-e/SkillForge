import { useState, useEffect } from 'react'
import { createRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon } from 'lucide-react'
import { rootRoute } from './__root'
import { api } from '../api/client'
import { getToolConfig } from '../components/ToolCardCompact'
import { ErrorContainer } from '../components/ErrorContainer'
import { H1 } from '../components/typography'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Skeleton } from '../components/ui/skeleton'

export const projectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId',
  component: ProjectDetailPage,
})

function ProjectDetailPage() {
  const { projectId } = projectDetailRoute.useParams()
  const queryClient = useQueryClient()

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => api.projects.get(projectId),
  })

  const [name, setName] = useState('')
  const [iconPath, setIconPath] = useState('')

  useEffect(() => {
    if (project) {
      setName(project.name)
      setIconPath(project.iconPath ?? '')
    }
  }, [project])

  const updateMutation = useMutation({
    mutationFn: (data: { name?: string; iconPath?: string | null }) =>
      api.projects.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
  })

  function handleSave() {
    updateMutation.mutate({
      name: name.trim(),
      iconPath: iconPath.trim() || null,
    })
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

  const detectedTools = project.detectedTools.filter((t) => t.detected)

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
        <H1>{project.name}</H1>
        <p className="text-muted-foreground font-mono text-sm">{project.path}</p>
      </div>

      <div className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="project-name">Project name</Label>
          <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-icon">Icon path</Label>
          <Input
            id="project-icon"
            value={iconPath}
            onChange={(e) => setIconPath(e.target.value)}
            placeholder="logo.svg"
          />
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
        {updateMutation.isError && (
          <p className="text-sm text-destructive">{updateMutation.error.message}</p>
        )}
        {updateMutation.isSuccess && (
          <p className="text-sm text-muted-foreground">Saved successfully.</p>
        )}
      </div>

      {detectedTools.length > 0 && (
        <div className="space-y-2">
          <Label>Detected tools</Label>
          <div className="flex flex-wrap gap-2">
            {detectedTools.map((t) => {
              const config = getToolConfig(t.name)
              return (
                <Badge key={t.name} variant="secondary">
                  {config.displayName}
                </Badge>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
