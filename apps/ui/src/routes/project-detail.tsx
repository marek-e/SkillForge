import { useState, useEffect } from 'react'
import { createRoute, useNavigate } from '@tanstack/react-router'
import * as stylex from '@stylexjs/stylex'
import type { CreateSkill, Skill, SkillItem } from '@skillforge/core'
import { PencilIcon, RefreshCwIcon, StarIcon, Trash2Icon } from 'lucide-react'
import { rootRoute } from './__root'
import {
  useProject,
  useProjectSkills,
  useRenameProject,
  useUpdateProjectIcon,
  useUpdateProjectEditor,
  useToggleFavoriteProject,
  useDeleteProject,
  useSaveSkillToLibrary,
} from '@/hooks/use-project-detail'
import { ErrorContainer } from '@/components/ErrorContainer'
import { H1 } from '@/components/typography'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ProjectAvatar } from '@/components/project-avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { RenameProjectDialog } from '@/components/project-detail/RenameProjectDialog'
import { ProjectOverviewCard } from '@/components/project-detail/ProjectOverviewCard'
import { ProjectSkillsSection } from '@/components/project-detail/ProjectSkillsSection'
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog'
import { cn } from '@/lib/utils'
import { colors } from '@/styles/tokens.stylex'
import { useBreadcrumb } from '@/lib/breadcrumbs'
import { useSkills } from '@/hooks/use-skill-library'

/**
 * Everything this route renders itself.
 *
 * `space-y-4`, `space-y-6` and `space-y-2` are child rules, and they migrate for
 * the reason `tools.tsx` and `skill-library.tsx` gave in PR 26 and PR 27: every
 * element they reach is one this route renders, a `Skeleton`, or a component
 * (`ProjectOverviewCard`, `ProjectSkillsSection`) whose own StyleX styles
 * declare no block-direction margin at all. Tailwind emits the pair with the
 * start margin at zero (`tailwind-values.md` §7); the compiler lowers
 * `marginBlock*` to the physical properties, the same resolution while the
 * document stays `horizontal-tb`.
 *
 * The two dialogs and the closed `Tooltip` render nothing in place, so which
 * element is `:last-child` is decided by the same DOM before and after.
 */
const styles = stylex.create({
  // `space-y-4` on the pending-project wrapper
  loading: {
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '1rem',
    },
  },

  // `space-y-6` on the page wrapper
  page: {
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '1.5rem',
    },
  },

  // `flex items-center gap-3` — the avatar beside the heading group
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },

  // `flex items-center gap-4` — the heading beside its action group
  headingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },

  // `flex items-center gap-1` — the four header actions
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },

  // `space-y-2` on the pending-skills wrapper
  skillsLoading: {
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '0.5rem',
    },
  },
})

/**
 * The delete action's override, handed to `Button` through its `sx` prop (PR 05).
 *
 * Byte-for-byte the style `ProjectsTable` passes its own delete action (PR 24),
 * because the class list is the same one. `stylex.props` merges a property as a
 * whole, so it has to restate every condition the `ghost` variant declares for
 * that property and that the classes it replaces did **not** already shadow:
 *
 * - `ghost`'s `aria-expanded:text-foreground` was already shadowed, because the
 *   plain `text-muted-foreground` utility sits in `@layer utilities` and beats
 *   any `priorityN` rule whatever its selector, so no such arm is declared here
 *   and the muted colour this button computes today is reproduced.
 * - `ghost`'s `aria-expanded:bg-muted` was **not** shadowed — no caller utility
 *   declared a plain `background-color` — so it is restated.
 *
 * This button is never a disclosure trigger, so `aria-expanded` is unreachable
 * here; the arm is kept for identity, not for looks.
 */
const buttonStyles = stylex.create({
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
 * The class lists this route hands to components it does not own, kept as
 * Tailwind for now (PR 32 removes every one of them).
 *
 * `Skeleton` is StyleX already but takes no `sx` prop, so a caller's size still
 * arrives as a `className` its `cn` appends — which is also what keeps the
 * override winning, since a utility outranks a `priorityN` rule.
 */
const SKELETON_TITLE_CLASSES = 'h-8 w-48'
const SKELETON_LEAD_CLASSES = 'h-4 w-96'
const SKELETON_SKILLS_LABEL_CLASSES = 'h-4 w-24'
const SKELETON_SKILLS_WIDE_CLASSES = 'h-4 w-64'
const SKELETON_SKILLS_NARROW_CLASSES = 'h-4 w-48'

/**
 * The three header actions whose colours come from the **Tailwind palette**,
 * kept as classes for the reason `ProjectsTable` spelled out in PR 24.
 *
 * `text-yellow-400` compiles to `color: var(--color-yellow-400)` and every
 * opacity-modified one to a `color-mix(in oklab, var(--color-yellow-400) N%,
 * transparent)` behind an `@supports` pair; `blue-500` and `green-500` are the
 * same shape. A StyleX declaration may not reference a Tailwind-generated
 * custom property, and the only alternative — the literal `oklch(...)` — is
 * folded by lightningcss into a hex/`lab()` pair, so the *computed* colour
 * string would change (PR 22 measured that fold).
 *
 * `group-hover/button:fill-yellow-400/50` has a second reason: it reaches the
 * star through the literal `group/button` class that `button.tsx` keeps
 * **naming this file and `components/projects/ProjectsTable.tsx`**. The star and
 * the button therefore move together, once that class and the palette variables
 * go. The delete action is the one of the four whose colours are theme tokens,
 * so it is the one that moves to `sx` above.
 */
const FAVORITE_BUTTON_CLASSES = 'text-yellow-400 hover:text-yellow-400'
const UNFAVORITE_BUTTON_CLASSES =
  'text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10 dark:hover:bg-yellow-400/20'
const FAVORITE_ICON_CLASSES = 'fill-yellow-400 group-hover/button:fill-yellow-400/50'
const RENAME_BUTTON_CLASSES =
  'text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 dark:hover:bg-blue-500/25'
const REFRESH_BUTTON_CLASSES =
  'text-muted-foreground hover:text-green-500 hover:bg-green-500/10 dark:hover:bg-green-500/20'

/**
 * An icon rendered inside a `Button` keeps a literal `size-*` class.
 *
 * `Button` sizes the icons it contains with
 * `[&_svg:not([class*='size-'])]:size-N`, a selector that reads the child's
 * `class` **attribute text**, not its computed size (`button.tsx`, PR 04). Once
 * a size moved into `stylex.create` the attribute would stop matching and the
 * button would own the icon's width and height — 12px for these `icon-xs`
 * buttons instead of 16px. It stays until PR 32 removes that rule.
 *
 * `animate-spin` rides in the same string. It resolves to
 * `animation: var(--animate-spin)`, a Tailwind theme variable PR 32 deletes, and
 * it is applied to the icon rather than to anything this route styles itself.
 */
const ICON_SIZE_CLASS = 'size-4'
const SPINNING_ICON_CLASS = 'animate-spin'

const toolMap: Record<string, Skill['originalTool']> = {
  'claude-code': 'claude',
  cursor: 'cursor',
  codex: 'openai',
  'gemini-cli': 'gemini',
  opencode: 'generic',
}

function skillItemToCreateSkill(skill: SkillItem, toolName: string): CreateSkill {
  return {
    name: skill.name,
    description: skill.description,
    body: skill.body,
    frontmatter: skill.frontmatter,
    implementationRef: skill.filePath,
    source: 'imported',
    originalTool: toolMap[toolName],
    tags: [],
    scope: 'general',
  }
}

export const projectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId',
  component: ProjectDetailPage,
})

function ProjectDetailPage() {
  const { projectId } = projectDetailRoute.useParams()
  const navigate = useNavigate()

  const { data: project, isPending, error } = useProject(projectId)
  const {
    data: skillsByTool,
    isFetching: skillsFetching,
    isPending: skillsPending,
    refetch: refetchSkills,
  } = useProjectSkills(projectId)
  const { data: librarySkills = [] } = useSkills()
  const saveSkill = useSaveSkillToLibrary()
  useBreadcrumb(`/projects/${projectId}`, project?.name)
  const renameMutation = useRenameProject(projectId)
  const updateIconMutation = useUpdateProjectIcon(projectId)
  const updateEditorMutation = useUpdateProjectEditor(projectId)
  const favoriteMutation = useToggleFavoriteProject(projectId)
  const deleteMutation = useDeleteProject(projectId)

  const [renameOpen, setRenameOpen] = useState(false)
  const [renameDraft, setRenameDraft] = useState('')
  const [iconPath, setIconPath] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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

  if (isPending) {
    return (
      <div {...stylex.props(styles.loading)}>
        <Skeleton className={SKELETON_TITLE_CLASSES} />
        <Skeleton className={SKELETON_LEAD_CLASSES} />
      </div>
    )
  }

  if (!project) return null
  return (
    <div {...stylex.props(styles.page)}>
      <div>
        <div {...stylex.props(styles.titleRow)}>
          <ProjectAvatar project={project} size="lg" />
          <div {...stylex.props(styles.headingRow)}>
            <H1>{project.name}</H1>
            <div {...stylex.props(styles.actions)}>
              <Button
                variant="ghost"
                size="icon-xs"
                className={cn(
                  project.isFavorite && FAVORITE_BUTTON_CLASSES,
                  !project.isFavorite && UNFAVORITE_BUTTON_CLASSES
                )}
                onClick={() => favoriteMutation.mutate()}
              >
                <StarIcon
                  className={cn(ICON_SIZE_CLASS, project.isFavorite && FAVORITE_ICON_CLASSES)}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                className={RENAME_BUTTON_CLASSES}
                onClick={() => {
                  setRenameDraft(project.name)
                  setRenameOpen(true)
                }}
              >
                <PencilIcon className={ICON_SIZE_CLASS} />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                sx={buttonStyles.deleteAction}
                onClick={() => {
                  deleteMutation.reset()
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2Icon className={ICON_SIZE_CLASS} />
              </Button>
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className={REFRESH_BUTTON_CLASSES}
                    onClick={() => refetchSkills()}
                    disabled={skillsFetching}
                  >
                    <RefreshCwIcon
                      className={cn(ICON_SIZE_CLASS, skillsFetching && SPINNING_ICON_CLASS)}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Refresh detected skills</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <RenameProjectDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        name={renameDraft}
        onNameChange={setRenameDraft}
        onSubmit={handleRename}
        isPending={renameMutation.isPending}
      />

      <ProjectOverviewCard
        project={project}
        iconPath={iconPath}
        onIconPathChange={setIconPath}
        onApplyIcon={(v) => updateIconMutation.mutate({ iconPath: v })}
        isIconPending={updateIconMutation.isPending}
        onEditorChange={(editor, customCmd) =>
          updateEditorMutation.mutate({
            preferredEditor: editor === 'auto' ? null : editor,
            customEditorCmd: editor === 'custom' ? customCmd || null : null,
          })
        }
      />

      {skillsPending ? (
        <div {...stylex.props(styles.skillsLoading)}>
          <Skeleton className={SKELETON_SKILLS_LABEL_CLASSES} />
          <Skeleton className={SKELETON_SKILLS_WIDE_CLASSES} />
          <Skeleton className={SKELETON_SKILLS_NARROW_CLASSES} />
        </div>
      ) : skillsByTool ? (
        <ProjectSkillsSection
          detectedTools={project.detectedTools}
          skillsByTool={skillsByTool}
          librarySkills={librarySkills}
          preferredEditor={project.preferredEditor}
          customEditorCmd={project.customEditorCmd}
          onSave={(skill, toolName) => saveSkill.mutate(skillItemToCreateSkill(skill, toolName))}
          isSaving={saveSkill.isPending}
        />
      ) : null}

      <DeleteProjectDialog
        project={deleteDialogOpen ? project : null}
        onOpenChange={(open) => !open && setDeleteDialogOpen(false)}
        onConfirm={() => {
          deleteMutation.mutate(undefined, {
            onSuccess: () => {
              setDeleteDialogOpen(false)
              navigate({ to: '/projects' })
            },
          })
        }}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
