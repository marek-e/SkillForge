import { useState, useMemo } from 'react'
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
import { ALL_TOOL_NAMES } from '@/lib/tool-config'
import { ErrorContainer } from '@/components/ErrorContainer'
import { H1, Lead } from '@/components/typography'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { ProjectsTable } from '@/components/projects/ProjectsTable'
import { ProjectsFilterBar } from '@/components/projects/ProjectsFilterBar'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTools, setSelectedTools] = useState<string[]>([])

  const { data: projects, isLoading, error, refetch } = useProjects()
  const createMutation = useCreateProject()
  const deleteMutation = useDeleteProject()
  const favoriteMutation = useToggleFavorite()

  const availableTools = useMemo(() => {
    const names = new Set(
      (projects ?? []).flatMap((p) => p.detectedTools.filter((t) => t.detected).map((t) => t.name))
    )
    return ALL_TOOL_NAMES.filter((name) => names.has(name))
  }, [projects])

  const filteredProjects = useMemo(() => {
    let result = projects ?? []
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.path.toLowerCase().includes(q)
      )
    }
    if (selectedTools.length > 0) {
      result = result.filter((p) =>
        selectedTools.every((tool) => p.detectedTools.some((t) => t.name === tool && t.detected))
      )
    }
    return result
  }, [projects, searchQuery, selectedTools])

  function handleToolToggle(tool: string) {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    )
  }

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

  const isFiltered = searchQuery.trim().length > 0 || selectedTools.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <H1>Projects</H1>
          <Lead>Manage your projects and their configurations.</Lead>
          {projects && (
            <p className="text-sm text-muted-foreground">
              {isFiltered
                ? `${filteredProjects.length} of ${projects.length} project${projects.length !== 1 ? 's' : ''}`
                : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
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
        <div className="space-y-4">
          <ProjectsFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            availableTools={availableTools}
            selectedTools={selectedTools}
            onToolToggle={handleToolToggle}
          />
          {filteredProjects.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No projects match your filters.
            </p>
          ) : (
            <ProjectsTable
              projects={filteredProjects}
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
        </div>
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
