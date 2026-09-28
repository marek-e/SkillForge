import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type OnChangeFn,
} from '@tanstack/react-table'
import * as stylex from '@stylexjs/stylex'
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
import { colors, fonts } from '@/styles/tokens.stylex'

const styles = stylex.create({
  // `flex items-center gap-2`
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  // `font-medium`
  nameText: {
    fontWeight: 500,
  },
  // `text-muted-foreground font-mono text-xs truncate max-w-[300px] block`.
  //
  // `truncate` is the three-declaration utility (`tailwind-values.md` §3), and
  // `text-xs`' paired line height is written as the length it resolves to; the
  // span holds nothing but text, so no descendant can inherit a ratio.
  pathText: {
    display: 'block',
    maxWidth: '300px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: colors.mutedForeground,
    fontFamily: fonts.mono,
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },
  // `flex flex-wrap gap-1`
  toolsCell: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
  },
})

/**
 * Overrides handed to `Button`, which takes an `sx` prop (PR 05).
 *
 * `stylex.props` merges a property as a whole, so both entries below have to
 * restate every condition the `ghost` variant declares for the same property
 * and that the Tailwind classes they replace did **not** already shadow:
 *
 * - `ghost`'s `aria-expanded:text-foreground` was already shadowed, because a
 *   plain `text-muted-foreground` utility sits in `@layer utilities` and beats
 *   any `priorityN` rule whatever its selector. Dropping that arm here
 *   reproduces the muted colour these buttons compute today.
 * - `ghost`'s `aria-expanded:bg-muted` was **not** shadowed - no caller utility
 *   declared a plain `background-color` - so it is restated.
 *
 * Neither button is ever a disclosure trigger, so `aria-expanded` is
 * unreachable in this file; the arms are kept for identity, not for looks.
 */
const buttonStyles = stylex.create({
  // `-ml-2` on the two sortable headers. `ml-*` is the physical longhand, as
  // Tailwind writes it, and `Button` declares no margin of its own.
  sortHeader: {
    marginLeft: '-0.5rem',
  },
  // `hover:text-destructive text-muted-foreground hover:bg-destructive/10
  //  dark:hover:bg-destructive/20`
  deleteAction: {
    color: {
      default: colors.mutedForeground,
      '@media (hover: hover)': { default: null, ':hover': colors.destructive },
    },
    backgroundColor: {
      default: null,
      ':is([aria-expanded="true"])': colors.muted,
      '@media (hover: hover)': {
        default: null,
        ':hover': 'color-mix(in oklab, var(--destructive) 10%, transparent)',
      },
      // `dark:hover:bg-destructive/20` is (0,3,0) and outranks the light-mode
      // hover; the nested wrapper reproduces that with a higher priority.
      ':is(.dark *)': {
        default: null,
        '@media (hover: hover)': {
          default: null,
          ':hover': 'color-mix(in oklab, var(--destructive) 20%, transparent)',
        },
      },
    },
  },
})

/**
 * The favourite star's colours, kept as Tailwind classes (removed in PR 32).
 *
 * Two reasons, both of which outlive this row:
 *
 * 1. `yellow-400` is a **Tailwind palette** colour. `text-yellow-400` compiles
 *    to `color: var(--color-yellow-400)` and the two opacity-modified ones to a
 *    `color-mix(in oklab, var(--color-yellow-400) N%, transparent)` behind an
 *    `@supports` pair. A StyleX declaration may not reference a
 *    Tailwind-generated custom property (it disappears in PR 32), and the only
 *    alternative - the literal `oklch(85.2% 0.199 91.936)` - is folded by
 *    lightningcss into a hex/`lab()` pair, so the *computed* colour string
 *    would change (PR 22 measured that fold).
 * 2. `group-hover/button:fill-yellow-400/50` reaches the icon through the
 *    literal `group/button` class that `button.tsx` keeps **for this file and
 *    `routes/project-detail.tsx`**. Star and button therefore move together,
 *    once that class and the palette variables go.
 */
const FAVORITE_BUTTON_CLASSES = 'text-yellow-400 hover:text-yellow-400'
const UNFAVORITE_BUTTON_CLASSES =
  'text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10 dark:hover:bg-yellow-400/20'
const FAVORITE_ICON_CLASSES = 'fill-yellow-400 group-hover/button:fill-yellow-400/50'

/**
 * An icon rendered inside a `Button` keeps a literal `size-*` class.
 *
 * `Button` sizes the icons it contains with
 * `[&_svg:not([class*='size-'])]:size-N`, a selector that reads the child's
 * `class` **attribute text**, not its computed size (`button.tsx`, PR 04;
 * `conventions.md`, "A class name can itself be the contract"). Once a size
 * moved into `stylex.create` the attribute would stop matching and the button
 * would own the icon's width and height - 12px for these `icon-xs` buttons,
 * and 14px for
 * the `sm` header buttons. Both stay until PR 32 removes those rules.
 */
const ICON_SIZE_CLASS = 'size-4'
const SORT_ICON_SIZE_CLASS = 'size-3.5'

/**
 * `cursor-pointer` on the body rows, kept as a Tailwind class (PR 32).
 *
 * `TableRow` takes no `sx` prop, so `className` is the only channel into it.
 */
const ROW_CLASSES = 'cursor-pointer'

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
            row.original.isFavorite && FAVORITE_BUTTON_CLASSES,
            !row.original.isFavorite && UNFAVORITE_BUTTON_CLASSES
          )}
          onClick={(e) => {
            e.stopPropagation()
            onFavoriteToggle(row.original.id)
          }}
        >
          <StarIcon
            className={cn(ICON_SIZE_CLASS, row.original.isFavorite && FAVORITE_ICON_CLASSES)}
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
          sx={buttonStyles.sortHeader}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDownIcon className={SORT_ICON_SIZE_CLASS} />
        </Button>
      ),
      cell: ({ row }) => (
        <div {...stylex.props(styles.nameCell)}>
          <ProjectAvatar project={row.original} size="sm" />
          <span {...stylex.props(styles.nameText)}>{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'path',
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          sx={buttonStyles.sortHeader}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Path
          <ArrowUpDownIcon className={SORT_ICON_SIZE_CLASS} />
        </Button>
      ),
      cell: ({ row }) => <span {...stylex.props(styles.pathText)}>{row.original.path}</span>,
    },
    {
      accessorKey: 'detectedTools',
      header: 'Tools',
      enableSorting: false,
      cell: ({ row }) => (
        <div {...stylex.props(styles.toolsCell)}>
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
          sx={buttonStyles.deleteAction}
          onClick={(e) => {
            e.stopPropagation()
            onDeleteClick(row.original)
          }}
        >
          <Trash2Icon className={ICON_SIZE_CLASS} />
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
          <TableRow key={row.id} className={ROW_CLASSES} onClick={() => onRowClick(row.original)}>
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
