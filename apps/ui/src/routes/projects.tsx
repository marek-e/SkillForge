import { useState } from 'react'
import { createRoute, useNavigate } from '@tanstack/react-router'
import type { SortingState } from '@tanstack/react-table'
import type { Project } from '@skillforge/core'
import { FolderOpenIcon, PlusIcon } from 'lucide-react'
import { rootRoute } from './__root'
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
  useToggleFavorite,
} from '@/hooks/use-projects'
import { isElectron } from '@/lib/electron'
import type { ElectronWindow } from '@/lib/electron'
import { ErrorContainer } from '@/components/ErrorContainer'
import { H1, Lead } from '@/components/typography'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { ProjectsTable } from '@/components/projects/ProjectsTable'
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog'
import { AddProjectWebDialog } from '@/components/projects/AddProjectWebDialog'

export const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: ProjectsPage,
})

function ProjectsPage() {
  const navigate = useNavigate()
  const [webDialogOpen, setWebDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'isFavorite', desc: true },
    { id: 'name', desc: false },
  ])

  const { data: projects, isLoading, error, refetch } = useProjects()
  const createMutation = useCreateProject()
  const deleteMutation = useDeleteProject()
  const favoriteMutation = useToggleFavorite()

  async function handleAddProject() {
    if (isElectron) {
      const folderPath = await (window as ElectronWindow).electronAPI!.openFolderDialog()
      if (folderPath) {
        createMutation.mutate({ path: folderPath })
      }
    } else {
      setWebDialogOpen(true)
    }
  }

  if (error) {
    return (
      <ErrorContainer
        title="Failed to load projects"
        message={error.message}
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <H1>Projects</H1>
          <Lead>Manage your projects and their configurations.</Lead>
          {projects && (
            <p className="text-sm text-muted-foreground">
              {projects.length} project{projects.length !== 1 && 's'}
            </p>
          )}
        </div>
        <Button onClick={handleAddProject} disabled={createMutation.isPending}>
          <PlusIcon />
          {createMutation.isPending ? 'Adding...' : 'Add project'}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <FolderOpenIcon className="size-10 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDescription>
              Add a project directory to see which AI tools are configured.
            </EmptyDescription>
          </EmptyHeader>
          <Button onClick={handleAddProject} disabled={createMutation.isPending}>
            <PlusIcon />
            Add project
          </Button>
        </Empty>
      ) : (
        <ProjectsTable
          projects={projects ?? []}
          sorting={sorting}
          onSortingChange={setSorting}
          onRowClick={(project) =>
            navigate({
              to: '/projects/$projectId',
              params: { projectId: project.id },
            })
          }
          onFavoriteToggle={(id) => favoriteMutation.mutate(id)}
          onDeleteClick={(project) => {
            deleteMutation.reset()
            setProjectToDelete(project)
          }}
        />
      )}

      <DeleteProjectDialog
        project={projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
        onConfirm={() => {
          if (!projectToDelete) return
          deleteMutation.mutate(projectToDelete.id, {
            onSuccess: () => setProjectToDelete(null),
          })
        }}
        isPending={deleteMutation.isPending}
      />

      <AddProjectWebDialog
        open={webDialogOpen}
        onOpenChange={setWebDialogOpen}
        onSubmit={(path) => createMutation.mutate({ path })}
        isPending={createMutation.isPending}
      />
    </div>
  )
}
