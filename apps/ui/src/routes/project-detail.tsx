import { projectActions } from '@/styles/project-actions.stylex'
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
        <Skeleton sx={overrideStyles.SKELETON_TITLE_CLASSES} />
        <Skeleton sx={overrideStyles.SKELETON_LEAD_CLASSES} />
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
                sx={project.isFavorite ? projectActions.favorite : projectActions.unfavorite}
                onClick={() => favoriteMutation.mutate()}
              >
                <StarIcon
                  className={[
                    'size-explicit',
                    stylex.props(projectActions.icon, project.isFavorite && projectActions.star)
                      .className,
                  ].join(' ')}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                sx={projectActions.rename}
                onClick={() => {
                  setRenameDraft(project.name)
                  setRenameOpen(true)
                }}
              >
                <PencilIcon
                  className={['size-explicit', stylex.props(projectActions.icon).className].join(
                    ' '
                  )}
                />
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
                <Trash2Icon
                  className={['size-explicit', stylex.props(projectActions.icon).className].join(
                    ' '
                  )}
                />
              </Button>
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    sx={projectActions.refresh}
                    onClick={() => refetchSkills()}
                    disabled={skillsFetching}
                  >
                    <RefreshCwIcon
                      className={[
                        'size-explicit',
                        stylex.props(projectActions.icon, skillsFetching && projectActions.spinning)
                          .className,
                      ].join(' ')}
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
          <Skeleton sx={overrideStyles.SKELETON_SKILLS_LABEL_CLASSES} />
          <Skeleton sx={overrideStyles.SKELETON_SKILLS_WIDE_CLASSES} />
          <Skeleton sx={overrideStyles.SKELETON_SKILLS_NARROW_CLASSES} />
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

const overrideStyles = stylex.create({
  SKELETON_TITLE_CLASSES: { height: '2rem', width: '12rem' },
  SKELETON_LEAD_CLASSES: { height: '1rem', width: '24rem' },
  SKELETON_SKILLS_LABEL_CLASSES: { height: '1rem', width: '6rem' },
  SKELETON_SKILLS_WIDE_CLASSES: { height: '1rem', width: '16rem' },
  SKELETON_SKILLS_NARROW_CLASSES: { height: '1rem', width: '12rem' },
})
