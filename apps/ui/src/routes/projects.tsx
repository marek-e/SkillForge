import { useState } from 'react'
import { createRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import type { Project } from '@skillforge/core'
import { FolderOpenIcon, PlusIcon, StarIcon, Trash2Icon, ArrowUpDownIcon } from 'lucide-react'
import { rootRoute } from './__root'
import { api } from '../api/client'
import { getToolConfig } from '../components/ToolCardCompact'
import { ErrorContainer } from '../components/ErrorContainer'
import { H1, Lead } from '../components/typography'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '../components/ui/empty'
import { cn } from '@/lib/utils'
import { isElectron } from '@/lib/electron'
import type { ElectronWindow } from '@/lib/electron'

export const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: ProjectsPage,
})

function ProjectsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [webDialogOpen, setWebDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'isFavorite', desc: true },
    { id: 'name', desc: false },
  ])

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: api.projects.list,
  })

  const createMutation = useMutation({
    mutationFn: api.projects.create,
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate({
        to: '/projects/$projectId',
        params: { projectId: project.id },
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: api.projects.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })

  const favoriteMutation = useMutation({
    mutationFn: api.projects.toggleFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })

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

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: 'isFavorite',
      header: '',
      size: 40,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-xs"
          className={cn(
            row.original.isFavorite && 'text-yellow-400 hover:text-yellow-400',
            !row.original.isFavorite &&
              'text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10 dark:hover:bg-yellow-400/20'
          )}
          onClick={(e) => {
            e.stopPropagation()
            favoriteMutation.mutate(row.original.id)
          }}
        >
          <StarIcon
            className={cn(
              'size-4',
              row.original.isFavorite && 'fill-yellow-400 group-hover/button:fill-yellow-400/50'
            )}
          />
        </Button>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDownIcon className="size-3.5" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'path',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Path
          <ArrowUpDownIcon className="size-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-xs truncate max-w-[300px] block">
          {row.original.path}
        </span>
      ),
    },
    {
      accessorKey: 'detectedTools',
      header: 'Tools',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.detectedTools
            .filter((t) => t.detected)
            .map((t) => {
              const config = getToolConfig(t.name)
              return (
                <Badge key={t.name} variant="secondary">
                  {config.displayName}
                </Badge>
              )
            })}
        </div>
      ),
    },
    {
      id: 'actions',
      size: 40,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-xs"
          className="hover:text-destructive text-muted-foreground hover:bg-destructive/10 dark:hover:bg-destructive/20"
          onClick={(e) => {
            e.stopPropagation()
            deleteMutation.reset()
            setProjectToDelete(row.original)
          }}
        >
          <Trash2Icon className="size-4" />
        </Button>
      ),
    },
  ]

  const table = useReactTable({
    data: projects ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (error) {
    return (
      <ErrorContainer
        title="Failed to load projects"
        message={error.message}
        onRetry={() => window.location.reload()}
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
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() =>
                  navigate({
                    to: '/projects/$projectId',
                    params: { projectId: row.original.id },
                  })
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {createMutation.isError && (
        <p className="text-sm text-destructive">{createMutation.error.message}</p>
      )}

      <Dialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
            <DialogDescription>
              This will remove <span className="font-bold">{projectToDelete?.name}</span> from your
              project list.
            </DialogDescription>
          </DialogHeader>
          {deleteMutation.isError && (
            <p className="text-sm text-destructive">{deleteMutation.error.message}</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setProjectToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending || !projectToDelete}
              onClick={() => {
                if (!projectToDelete) return
                deleteMutation.mutate(projectToDelete.id, {
                  onSuccess: () => setProjectToDelete(null),
                })
              }}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddProjectWebDialog
        open={webDialogOpen}
        onOpenChange={setWebDialogOpen}
        onSubmit={(path) => createMutation.mutate({ path })}
        isPending={createMutation.isPending}
        error={createMutation.isError ? createMutation.error.message : undefined}
      />
    </div>
  )
}

function AddProjectWebDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  error,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (path: string) => void
  isPending: boolean
  error?: string
}) {
  const [path, setPath] = useState('')

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    onSubmit(path.trim())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-path">Directory path</Label>
            <Input
              id="project-path"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/Users/you/projects/my-project"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adding...' : 'Add project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
