import { createRoute, useNavigate } from '@tanstack/react-router'
import * as stylex from '@stylexjs/stylex'
import type { Skill, SkillScope } from '@skillforge/core'
import { ArrowLeftIcon, Trash2Icon } from 'lucide-react'
import { rootRoute } from './__root'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DeleteSkillDialog } from '@/components/skills/DeleteSkillDialog'
import { SkillDetailResourceFiles } from '@/components/skills/SkillDetailResourceFiles'
import { TagsInput } from '@/components/skills/TagsInput'
import { colors, fonts } from '@/styles/tokens.stylex'
import { getToolConfig, originalToolToName } from '@/lib/tool-config'
import { useBreadcrumb } from '@/lib/breadcrumbs'
import { useSkill, useSkillDirectory, useDeleteSkill } from '@/hooks/use-skill-detail'
import { useAvailableTags } from '@/hooks/use-skill-library'
import { useSkillDetailForm } from '@/hooks/use-skill-detail-form'
import { useState } from 'react'

/**
 * The class lists this route hands to a component it does not own. They stay
 * Tailwind for now; PR 32 removes them together with the rules they contest.
 *
 * `Skeleton`, `Input`, `Textarea` and `Badge` are StyleX already but none of
 * them takes an `sx` prop, so a caller's override still arrives as the
 * `className` their `cn` appends — which is also what keeps it winning, since a
 * utility sits in the `utilities` layer and a `priorityN` rule does not.
 * `Button` and `Label` do take one, but this route passes them nothing to
 * override.
 *
 * Two of these are more than a missing prop:
 *
 * - `size-4` on the two icons is read as **text**. `Button` sizes the icons
 *   inside it with `[&_svg:not([class*='size-'])]:size-N` — `size-3` at
 *   `icon-xs`, `size-3.5` at `sm` — and that selector matches on the literal
 *   `class` attribute, not on a computed width. Hashing it would hand both
 *   icons back to the button, which sizes them down to 12px and 14px from the
 *   16px they measure today (`conventions.md`, "A class name can itself be the
 *   contract", PR 08). The plain English word for that reduction is itself a
 *   utility name, and PR 24 watched the scanner turn one into a rule.
 * - the name field's list contests `input.tsx`'s own declarations, which is why
 *   that file's `CONTESTED_CLASSES` block already names this route: its
 *   `md:text-sm` is a media query emitted after the caller's `text-2xl`, so
 *   above 48rem the component used to win, and as StyleX it would not
 *   (`conventions.md`, "A caller's utility also shadows…", PR 05).
 *
 * The rest are plain overrides of a size or a spacing step. `text-xs` on the
 * `SKILL.md` badge is redundant against `badgeVariants`' own, and is kept
 * verbatim because dropping a class is a behaviour change this row may not
 * make; both forms measure 12px / 16px (PR 27).
 */
const SKELETON_TITLE_CLASSES = 'h-8 w-48'
const SKELETON_LINE_CLASSES = 'h-4 w-96'
const SKELETON_BODY_CLASSES = 'h-64 w-full'
const BUTTON_ICON_CLASSES = 'size-4'
const NAME_INPUT_CLASSES =
  'text-2xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0'
const BADGE_TOOL_CLASSES = 'gap-1 px-1.5 py-0'
const BADGE_FILE_CLASSES = 'text-xs px-1.5 py-0 font-mono'
const BODY_TEXTAREA_CLASSES = 'font-mono text-xs min-h-64'

/**
 * Everything this route renders itself.
 *
 * `space-y-*` is a child rule — `:where(& > :not(:last-child))` — but every
 * element it reaches here is one of this route's own boxes, or a StyleX
 * component (`Label`, `Input`, `Textarea`, `TagsInput`, `SelectTrigger`,
 * `SkillDetailResourceFiles`, `DeleteSkillDialog`) whose own styles declare no
 * block margin at all, so the (0,2,0) `priorityN` form loses to nothing the
 * (0,0,0) utility used to beat. That is the line PR 22, PR 26 and PR 27 drew,
 * and the opposite of `divide-y`, which writes a border onto an element its
 * container does not render. Tailwind emits the pair with the start margin at
 * zero (`tailwind-values.md` §7); the compiler lowers it to the physical
 * `margin-top`/`margin-bottom`, the same resolution while the document stays
 * `horizontal-tb`.
 *
 * The three `text-*` declarations are two leaf paragraphs and one leaf `<span>`
 * of plain text, with no descendant of their own and no caller able to put one
 * inside them, so each paired line height is written as the length it resolves
 * to rather than the ratio lightningcss would round (`conventions.md`, "Paired
 * line-heights").
 */
const styles = stylex.create({
  // `space-y-4`
  loading: {
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '1rem',
    },
  },

  // `space-y-6`
  page: {
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '1.5rem',
    },
  },

  // `flex items-center gap-3`
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },

  // `flex items-center gap-2 flex-wrap`
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },

  // `text-xs text-muted-foreground`
  metaText: {
    color: colors.mutedForeground,
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },

  // `space-y-2`
  field: {
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '0.5rem',
    },
  },

  // `grid grid-cols-2 gap-4`. Both columns are unconditional — the route
  // declares no breakpoint anywhere — so there is no media query to order.
  fieldRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '1rem',
  },

  // `text-xs text-muted-foreground font-mono`
  pathText: {
    color: colors.mutedForeground,
    fontSize: '0.75rem',
    lineHeight: '1rem',
    fontFamily: fonts.mono,
  },

  // `flex items-center gap-2`
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  // `text-sm text-muted-foreground`
  emptyText: {
    color: colors.mutedForeground,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },

  // `flex items-center justify-between`
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // `size-3`, on an `<img>` this route renders itself. No `[class*='size-']`
  // rule reaches it: `badge.tsx` sizes only its `[&>svg]` children, and this
  // element is not one (PR 27).
  badgeLogo: {
    width: '0.75rem',
    height: '0.75rem',
  },

  // `dark:invert`. Tailwind routes it through `--tw-invert` into its nine-slot
  // chain, which computes to the single function below; lightningcss folds the
  // literal `invert(100%)` to `invert()`, the same computed `invert(1)` (PR 22).
  badgeLogoInvert: {
    filter: {
      default: null,
      ':is(.dark *)': 'invert(100%)',
    },
  },
})

function dirnamePath(filePath: string): string {
  const idx = filePath.lastIndexOf('/')
  return idx >= 0 ? filePath.slice(0, idx) : filePath
}

export const skillDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/skill-library/$skillId',
  component: SkillDetailPage,
})

function SkillDetailPage() {
  const { skillId } = skillDetailRoute.useParams()
  const { data: skill, isLoading: skillLoading } = useSkill(skillId)

  useBreadcrumb(`/skill-library/${skillId}`, skill?.name)

  if (skillLoading) {
    return (
      <div {...stylex.props(styles.loading)}>
        <Skeleton className={SKELETON_TITLE_CLASSES} />
        <Skeleton className={SKELETON_LINE_CLASSES} />
        <Skeleton className={SKELETON_BODY_CLASSES} />
      </div>
    )
  }

  if (!skill) return null

  return <SkillDetailForm skill={skill} skillId={skillId} />
}

function SkillDetailForm({ skill, skillId }: { skill: Skill; skillId: string }) {
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data: directoryData } = useSkillDirectory(skillId, skill.implementationRef)
  const deleteMutation = useDeleteSkill(skillId)
  const availableTags = useAvailableTags()

  const {
    nameDraft,
    setNameDraft,
    descriptionDraft,
    setDescriptionDraft,
    bodyDraft,
    setBodyDraft,
    scopeDraft,
    setScopeDraft,
    tagsDraft,
    setTagsDraft,
    fileDrafts,
    setFileDrafts,
    loadedFileContentsRef,
    hasChanges,
    isSaving,
    handleSave,
  } = useSkillDetailForm(skill, skillId)

  const toolName = skill.originalTool ? originalToolToName[skill.originalTool] : undefined
  const config = toolName ? getToolConfig(toolName) : undefined
  const skillDir = skill.implementationRef ? dirnamePath(skill.implementationRef) : undefined
  const resourceFiles = directoryData?.files.filter((f) => f !== 'SKILL.md') ?? []

  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.titleRow)}>
        {/* No `className`: the `ghost` variant already paints
            `text-muted-foreground`, and passing it again shadowed the variant's
            own `hover:text-foreground` once `Button` moved to StyleX (PR 05). */}
        <Button variant="ghost" size="icon-xs" onClick={() => navigate({ to: '/skill-library' })}>
          <ArrowLeftIcon className={BUTTON_ICON_CLASSES} />
        </Button>
        <Input
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          className={NAME_INPUT_CLASSES}
          placeholder="Skill name"
        />
      </div>

      <div {...stylex.props(styles.metaRow)}>
        {config && (
          <Badge variant="outline" className={BADGE_TOOL_CLASSES}>
            <img
              src={config.logo}
              alt={config.displayName}
              {...stylex.props(styles.badgeLogo, config.invert && styles.badgeLogoInvert)}
            />
            {config.displayName}
          </Badge>
        )}
        <Badge variant="secondary">{skill.source}</Badge>
        <span {...stylex.props(styles.metaText)}>
          Added {new Date(skill.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div {...stylex.props(styles.field)}>
        <Label>Description</Label>
        <Input
          value={descriptionDraft}
          onChange={(e) => setDescriptionDraft(e.target.value)}
          placeholder="Skill description"
        />
      </div>

      <div {...stylex.props(styles.fieldRow)}>
        <div {...stylex.props(styles.field)}>
          <Label>Scope</Label>
          <Select value={scopeDraft} onValueChange={(v) => setScopeDraft(v as SkillScope)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="project-specific">Project-specific</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div {...stylex.props(styles.field)}>
          <Label>Tags</Label>
          <TagsInput value={tagsDraft} onChange={setTagsDraft} suggestions={availableTags} />
        </div>
      </div>

      {skillDir && (
        <div {...stylex.props(styles.field)}>
          <Label>Skill directory</Label>
          <p {...stylex.props(styles.pathText)}>{skillDir}</p>
        </div>
      )}

      {skill.implementationRef && (
        <div {...stylex.props(styles.field)}>
          <div {...stylex.props(styles.labelRow)}>
            <Label>Instructions</Label>
            <Badge variant="outline" className={BADGE_FILE_CLASSES}>
              SKILL.md
            </Badge>
          </div>
          <Textarea
            value={bodyDraft}
            onChange={(e) => setBodyDraft(e.target.value)}
            className={BODY_TEXTAREA_CLASSES}
            placeholder="Skill instructions…"
          />
        </div>
      )}

      {!skill.implementationRef && (
        <p {...stylex.props(styles.emptyText)}>No file associated with this skill.</p>
      )}

      {resourceFiles.length > 0 && (
        <SkillDetailResourceFiles
          skillId={skillId}
          files={resourceFiles}
          fileDrafts={fileDrafts}
          loadedFileContentsRef={loadedFileContentsRef}
          onFileDraftChange={(file, content) =>
            setFileDrafts((prev) => ({ ...prev, [file]: content }))
          }
        />
      )}

      <DeleteSkillDialog
        skill={deleteDialogOpen ? skill : null}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => deleteMutation.mutate()}
        isPending={deleteMutation.isPending}
      />

      <div {...stylex.props(styles.actionsRow)}>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={deleteMutation.isPending}
        >
          <Trash2Icon className={BUTTON_ICON_CLASSES} />
          Remove from library
        </Button>
        <Button size="sm" onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}
