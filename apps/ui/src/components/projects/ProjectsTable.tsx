import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type OnChangeFn,
} from '@tanstack/react-table'
import type { Project } from '@skillforge/core'
import { StarIcon, Trash2Icon, ArrowUpDownIcon } from 'lucide-react'
import { getToolConfig } from '@/lib/tool-config'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProjectAvatar } from '@/components/project-avatar'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface ProjectsTableProps {
  projects: Project[]
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  onRowClick: (project: Project) => void
  onFavoriteToggle: (projectId: string) => void
  onDeleteClick: (project: Project) => void
}

export function ProjectsTable({
  projects,
  sorting,
  onSortingChange,
  onRowClick,
  onFavoriteToggle,
  onDeleteClick,
}: ProjectsTableProps) {
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
            onFavoriteToggle(row.original.id)
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
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ProjectAvatar project={row.original} size="sm" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
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
            onDeleteClick(row.original)
          }}
        >
          <Trash2Icon className="size-4" />
        </Button>
      ),
    },
  ]

  const table = useReactTable({
    data: projects,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
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
            onClick={() => onRowClick(row.original)}
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
  )
}
