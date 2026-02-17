import { useState, useEffect } from 'react'
import { createRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeftIcon, PencilIcon, RefreshCwIcon } from 'lucide-react'
import { rootRoute } from './__root'
import { api } from '../api/client'
import { getToolConfig } from '@/lib/tool-config'
import { ErrorContainer } from '../components/ErrorContainer'
import { H1 } from '../components/typography'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
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

  const [renameOpen, setRenameOpen] = useState(false)
  const [renameDraft, setRenameDraft] = useState('')
  const [iconPath, setIconPath] = useState('')

  useEffect(() => {
    if (project) {
      setIconPath(project.iconPath ?? '')
    }
  }, [project])

  const renameMutation = useMutation({
    mutationFn: (data: { name: string }) => api.projects.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
      setRenameOpen(false)
    },
  })

  const updateIconMutation = useMutation({
    mutationFn: (data: { iconPath: string | null }) => api.projects.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
  })

  const refreshToolsMutation = useMutation({
    mutationFn: () => api.projects.refreshTools(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  function handleRename() {
    const trimmed = renameDraft.trim()
    if (!trimmed) return
    renameMutation.mutate({ name: trimmed })
  }

  function handleSaveIcon() {
    updateIconMutation.mutate({
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
        <p className="text-muted-foreground font-mono text-sm">{project.path}</p>
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rename-input">Project name</Label>
            <Input
              id="rename-input"
              value={renameDraft}
              onChange={(e) => setRenameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename()
              }}
            />
          </div>
          {renameMutation.isError && (
            <p className="text-sm text-destructive">{renameMutation.error.message}</p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameOpen(false)}
              disabled={renameMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={renameMutation.isPending || !renameDraft.trim()}
            >
              {renameMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="project-icon">Icon path</Label>
          <Input
            id="project-icon"
            value={iconPath}
            onChange={(e) => setIconPath(e.target.value)}
            placeholder="logo.svg"
          />
        </div>
        <Button onClick={handleSaveIcon} disabled={updateIconMutation.isPending}>
          {updateIconMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
        {updateIconMutation.isError && (
          <p className="text-sm text-destructive">{updateIconMutation.error.message}</p>
        )}
        {updateIconMutation.isSuccess && (
          <p className="text-sm text-muted-foreground">Saved successfully.</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Detected tools</Label>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => refreshToolsMutation.mutate()}
            disabled={refreshToolsMutation.isPending}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCwIcon
              className={`size-3.5 ${refreshToolsMutation.isPending ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
        {detectedTools.length > 0 ? (
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
        ) : (
          <p className="text-sm text-muted-foreground">No tools detected</p>
        )}
      </div>
    </div>
  )
}
