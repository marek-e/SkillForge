import { useState } from 'react'
import * as stylex from '@stylexjs/stylex'
import { Link } from '@tanstack/react-router'
import type { DetectedTool, Skill, SkillItem } from '@skillforge/core'
import {
  BookmarkCheck,
  BookmarkPlusIcon,
  CheckIcon,
  ClipboardCopyIcon,
  ExternalLinkIcon,
} from 'lucide-react'
import { getToolConfig } from '@/lib/tool-config'
import { getElectronAPI, isElectron } from '@/lib/electron'
import { getCustomEditorCmd, getDefaultEditor } from '@/lib/editor-settings'
import { getDefaultSkillView, setDefaultSkillView, type SkillViewMode } from '@/lib/skill-view'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DisplayViewSwitch } from '@/components/ui/display-view-switch'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SkillCard } from '@/components/skills/SkillCard'
import { colors } from '@/styles/tokens.stylex'

const styles = stylex.create({
  // `space-y-2`, a child rule (`:where(& > :not(:last-child))`) that emits both
  // block margins, the start one at zero (`tailwind-values.md` §7). Both
  // children - the header row and the list - are rendered here.
  section: {
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '0.5rem',
    },
  },
  // `flex items-center gap-2`
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  // `ml-auto flex items-center gap-2`
  headerActions: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  // `flex items-center gap-0.5 shrink-0`
  rowActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.125rem',
    flexShrink: 0,
  },
  // `text-sm text-muted-foreground`; the paired line height is written as the
  // length it resolves to and the paragraph holds nothing but text.
  emptyText: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: colors.mutedForeground,
  },
  // `grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(1, minmax(0, 1fr))',
      '@media (width >= 40rem)': 'repeat(2, minmax(0, 1fr))',
      '@media (width >= 64rem)': 'repeat(3, minmax(0, 1fr))',
      '@media (width >= 80rem)': 'repeat(4, minmax(0, 1fr))',
    },
    gap: '0.75rem',
  },
  // `size-3` on the tool logo. The logo is an `<img>` inside a `Badge`, whose
  // only icon rule is `[&>svg]:size-3!` - an `img` never matches it - so this
  // size is uncontested.
  toolLogo: {
    width: '0.75rem',
    height: '0.75rem',
  },
  // `dark:invert`. Tailwind's `invert` sets `--tw-invert: invert(100%)` inside
  // a `filter` chain whose other slots are empty (`tailwind-values.md` §8).
  toolLogoInverted: {
    filter: { default: null, ':is(.dark *)': 'invert(100%)' },
  },
})

/** The grid branch's styles, resolved once. */
const gridProps = stylex.props(styles.grid)

/**
 * Overrides that stay Tailwind class strings (all removed in PR 32).
 *
 * - `divide-y divide-border` styles the **children** of the list wrapper, and
 *   those children are `SkillCard`s - a component this row does not own and
 *   which is still Tailwind (PR 23). A StyleX rule sits in a `priorityN` layer
 *   and would lose to any border utility that component grows, where the
 *   utility it replaces would have won on specificity
 *   (`conventions.md`, "A rule that styles a foreign element stays Tailwind").
 * - `Badge` takes no `sx` prop, so `className` is the only channel into it.
 * - `size-3` / `size-3.5` on the action icons: they sit inside `icon-xs` and
 *   default `Button`s, whose `[&_svg:not([class*='size-'])]:size-N` reads the
 *   child's `class` **attribute text**, not its computed size (`button.tsx`,
 *   PR 04). A StyleX hash would stop matching and the button would then own
 *   their width and height.
 * - `text-green-500` and `text-muted-foreground` ride along in those same icon
 *   strings. `green-500` is a Tailwind **palette** colour: `text-green-500`
 *   compiles to `color: var(--color-green-500)`, a generated custom property a
 *   StyleX rule may not reference, and the literal alternative is folded by
 *   lightningcss into a different computed string (PR 22).
 */
const LIST_CLASSES = 'divide-y divide-border'
const COUNT_BADGE_CLASSES = 'text-xs'
const TOOL_BADGE_CLASSES = 'text-xs gap-1 px-1.5 py-0'
const SAVE_ALL_ICON_CLASS = 'size-3'
const ICON_COPIED_CLASSES = 'size-3.5 text-green-500'
const ICON_SAVED_CLASSES = 'size-3.5 text-green-500'
const ICON_MUTED_CLASSES = 'size-3.5 text-muted-foreground'

interface SkillRow {
  skill: SkillItem
  toolName: string
}

interface ProjectSkillsSectionProps {
  detectedTools: DetectedTool[]
  skillsByTool: Record<string, SkillItem[]>
  librarySkills: Skill[]
  preferredEditor?: string | null
  customEditorCmd?: string | null
  onSave: (skill: SkillItem, toolName: string) => void
  isSaving: boolean
}

function isSingleFile(skill: SkillItem): boolean {
  return typeof skill.body === 'string' && skill.body.trim().length > 0
}

function getSkillDir(filePath: string): string {
  const idx = filePath.lastIndexOf('/')
  return idx === -1 ? filePath : filePath.substring(0, idx)
}

export function ProjectSkillsSection({
  detectedTools,
  skillsByTool,
  librarySkills,
  preferredEditor,
  customEditorCmd,
  onSave,
  isSaving,
}: ProjectSkillsSectionProps) {
  const [copiedPath, setCopiedPath] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<SkillViewMode>(() => getDefaultSkillView())

  function handleViewModeChange(mode: SkillViewMode) {
    setViewMode(mode)
    setDefaultSkillView(mode)
  }

  const detected = detectedTools.filter((t) => t.detected)
  if (detected.length === 0) return null

  const rows: SkillRow[] = detected.flatMap((tool) =>
    (skillsByTool[tool.name] ?? []).map((skill) => ({ skill, toolName: tool.name }))
  )

  const savedSkillIdsByRef = new Map(
    librarySkills.filter((s) => s.implementationRef).map((s) => [s.implementationRef, s.id])
  )
  const unsavedRows = rows.filter(({ skill }) => !savedSkillIdsByRef.has(skill.filePath))

  function handleCopy(skill: SkillItem) {
    if (!skill.body) return
    void navigator.clipboard.writeText(skill.body)
    setCopiedPath(skill.filePath)
    setTimeout(() => setCopiedPath(null), 1500)
  }

  function handleOpenInEditor(skill: SkillItem) {
    const api = getElectronAPI()
    if (!api) return
    const single = isSingleFile(skill)
    const path = single ? skill.filePath : getSkillDir(skill.filePath)
    const effectiveEditor = preferredEditor ?? getDefaultEditor()
    const cmd =
      effectiveEditor === 'custom' ? (customEditorCmd ?? getCustomEditorCmd()) : effectiveEditor
    void api.openInEditor(path, cmd === 'auto' ? undefined : cmd)
  }

  function renderSkillActions(skill: SkillItem, toolName: string) {
    const savedId = savedSkillIdsByRef.get(skill.filePath)
    const isSaved = savedId !== undefined
    const single = isSingleFile(skill)
    const isCopied = copiedPath === skill.filePath

    return (
      <div {...stylex.props(styles.rowActions)}>
        {single && (
          <Tooltip delayDuration={700}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-xs" onClick={() => handleCopy(skill)}>
                {isCopied ? (
                  <CheckIcon className={ICON_COPIED_CLASSES} />
                ) : (
                  <ClipboardCopyIcon className={ICON_MUTED_CLASSES} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isCopied ? 'Copied!' : 'Copy content'}</TooltipContent>
          </Tooltip>
        )}

        {isElectron && (
          <Tooltip delayDuration={700}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-xs" onClick={() => handleOpenInEditor(skill)}>
                <ExternalLinkIcon className={ICON_MUTED_CLASSES} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {single ? 'Open file in editor' : 'Open folder in editor'}
            </TooltipContent>
          </Tooltip>
        )}

        {isSaved ? (
          <Tooltip delayDuration={700}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-xs" asChild>
                <Link to="/skill-library/$skillId" params={{ skillId: savedId }}>
                  <BookmarkCheck className={ICON_SAVED_CLASSES} />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>View in library</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip delayDuration={700}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                disabled={isSaving}
                onClick={() => onSave(skill, toolName)}
              >
                <BookmarkPlusIcon className={ICON_MUTED_CLASSES} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save to library</TooltipContent>
          </Tooltip>
        )}
      </div>
    )
  }

  return (
    <div {...stylex.props(styles.section)}>
      <div {...stylex.props(styles.header)}>
        <Label>Skills</Label>
        {rows.length > 0 && (
          <Badge variant="secondary" className={COUNT_BADGE_CLASSES}>
            {rows.length}
          </Badge>
        )}
        <div {...stylex.props(styles.headerActions)}>
          {unsavedRows.length > 0 && (
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => {
                for (const { skill, toolName } of unsavedRows) {
                  onSave(skill, toolName)
                }
              }}
            >
              <BookmarkPlusIcon className={SAVE_ALL_ICON_CLASS} />
              Save all
            </Button>
          )}
          <DisplayViewSwitch value={viewMode} onChange={handleViewModeChange} />
        </div>
      </div>

      {rows.length === 0 ? (
        <p {...stylex.props(styles.emptyText)}>No skills found in this project</p>
      ) : (
        <div className={viewMode === 'grid' ? gridProps.className : LIST_CLASSES}>
          {rows.map(({ skill, toolName }) => {
            const config = getToolConfig(toolName)
            return (
              <SkillCard
                key={`${toolName}:${skill.name}`}
                viewMode={viewMode}
                name={skill.name}
                description={skill.description}
                badges={
                  <Badge variant="outline" className={TOOL_BADGE_CLASSES}>
                    <img
                      src={config.logo}
                      alt={config.displayName}
                      {...stylex.props(styles.toolLogo, config.invert && styles.toolLogoInverted)}
                    />
                    {config.displayName}
                  </Badge>
                }
                actions={renderSkillActions(skill, toolName)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
