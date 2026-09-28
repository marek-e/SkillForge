import { useState, useMemo } from 'react'
import { createRoute, useNavigate } from '@tanstack/react-router'
import * as stylex from '@stylexjs/stylex'
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
import { colors } from '@/styles/tokens.stylex'

/**
 * The one class list this route hands to a component it does not own, kept as
 * Tailwind for now (PR 32 removes it).
 *
 * `Skeleton` is StyleX already but takes no `sx` prop, so a caller's size still
 * arrives as a `className` its `cn` appends — which is also what keeps this
 * override winning: `@layer utilities` sits above every `priorityN` layer, so a
 * utility outranks a StyleX rule whatever the selector. Nothing here is
 * redundant, either: `skeleton.tsx` declares `rounded-md` (`8px`) itself and
 * `rounded-lg` (`10px`) is the caller overruling it, which only a utility can
 * do from the outside.
 */
const SKELETON_CLASSES = 'h-12 w-full rounded-lg'

const styles = stylex.create({
  // `space-y-6`, over the header, the body branch and the two dialogs.
  page: {
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '1.5rem',
    },
  },

  // `flex items-start justify-between`
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  // `space-y-2`, over `H1`, `Lead` and the count paragraph — all three elements
  // this route renders, none with a block margin of its own.
  headerText: {
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '0.5rem',
    },
  },

  // `text-sm text-muted-foreground`; a paragraph of plain text with no
  // descendant of its own, so the paired line height is written as the length
  // it resolves to (`conventions.md`, "Paired line-heights").
  mutedText: {
    color: colors.mutedForeground,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },

  // `space-y-2`, over the three loading skeletons.
  skeletons: {
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '0.5rem',
    },
  },

  // `space-y-4`, over the filter bar and the table.
  content: {
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '1rem',
    },
  },

  // `py-8 text-center text-sm text-muted-foreground`, on the "no match"
  // paragraph. `py-*` is logical in Tailwind, so it stays `paddingBlock`
  // (`conventions.md`, "`py-*`/`px-*` are logical").
  noMatchText: {
    paddingBlock: '2rem',
    textAlign: 'center',
    color: colors.mutedForeground,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },

  // `size-10 text-muted-foreground`, on the icon this route puts inside
  // `EmptyMedia`. The `[class*='size-']` contract does not reach it: the rule
  // is `[&_svg:not([class*='size-'])]:size-4` and `empty.tsx` only applies it
  // for `variant="icon"`, while this `EmptyMedia` takes the default variant,
  // whose only child rules are `[&_svg]:pointer-events-none [&_svg]:shrink-0`.
  // So no utility competes for width, height or colour once these are StyleX.
  emptyIcon: {
    width: '2.5rem',
    height: '2.5rem',
    color: colors.mutedForeground,
  },
})

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
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.headerText)}>
          <H1>Projects</H1>
          <Lead>Manage your projects and their configurations.</Lead>
          {projects && (
            <p {...stylex.props(styles.mutedText)}>
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
        <div {...stylex.props(styles.skeletons)}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className={SKELETON_CLASSES} />
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <FolderOpenIcon {...stylex.props(styles.emptyIcon)} />
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
        <div {...stylex.props(styles.content)}>
          <ProjectsFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            availableTools={availableTools}
            selectedTools={selectedTools}
            onToolToggle={handleToolToggle}
          />
          {filteredProjects.length === 0 ? (
            <p {...stylex.props(styles.noMatchText)}>No projects match your filters.</p>
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
