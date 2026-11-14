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
        <Skeleton sx={overrideStyles.SKELETON_TITLE_CLASSES} />
        <Skeleton sx={overrideStyles.SKELETON_LINE_CLASSES} />
        <Skeleton sx={overrideStyles.SKELETON_BODY_CLASSES} />
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
          <ArrowLeftIcon
            className={[
              'size-explicit',
              stylex.props(overrideStyles.BUTTON_ICON_CLASSES).className,
            ].join(' ')}
          />
        </Button>
        <Input
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          sx={overrideStyles.NAME_INPUT_CLASSES}
          placeholder="Skill name"
        />
      </div>

      <div {...stylex.props(styles.metaRow)}>
        {config && (
          <Badge variant="outline" sx={overrideStyles.BADGE_TOOL_CLASSES}>
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
            <Badge variant="outline" sx={overrideStyles.BADGE_FILE_CLASSES}>
              SKILL.md
            </Badge>
          </div>
          <Textarea
            value={bodyDraft}
            onChange={(e) => setBodyDraft(e.target.value)}
            sx={overrideStyles.BODY_TEXTAREA_CLASSES}
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
          <Trash2Icon
            className={[
              'size-explicit',
              stylex.props(overrideStyles.BUTTON_ICON_CLASSES).className,
            ].join(' ')}
          />
          Remove from library
        </Button>
        <Button size="sm" onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}

const overrideStyles = stylex.create({
  SKELETON_TITLE_CLASSES: { height: '2rem', width: '12rem' },
  SKELETON_LINE_CLASSES: { height: '1rem', width: '24rem' },
  SKELETON_BODY_CLASSES: { height: '16rem', width: '100%' },
  BUTTON_ICON_CLASSES: { width: '1rem', height: '1rem' },
  NAME_INPUT_CLASSES: {
    fontSize: { default: '1.5rem', '@media (width >= 48rem)': '0.875rem' },
    lineHeight: { default: '2rem', '@media (width >= 48rem)': '1.25rem' },
    fontWeight: 700,
    borderStyle: 'none',
    boxShadow: {
      default: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000',
      ':focus-visible':
        '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 0px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000',
    },
    paddingLeft: '0rem',
    paddingRight: '0rem',
    height: 'auto',
  },
  BADGE_TOOL_CLASSES: {
    gap: '0.25rem',
    paddingLeft: '0.375rem',
    paddingRight: '0.375rem',
    paddingTop: '0rem',
    paddingBottom: '0rem',
  },
  BADGE_FILE_CLASSES: {
    fontSize: '0.75rem',
    lineHeight: '1rem',
    paddingLeft: '0.375rem',
    paddingRight: '0.375rem',
    paddingTop: '0rem',
    paddingBottom: '0rem',
    fontFamily: fonts.mono,
  },
  BODY_TEXTAREA_CLASSES: {
    fontFamily: fonts.mono,
    fontSize: { default: '0.75rem', '@media (width >= 48rem)': '0.875rem' },
    lineHeight: { default: '1rem', '@media (width >= 48rem)': '1.25rem' },
    minHeight: '16rem',
  },
})
