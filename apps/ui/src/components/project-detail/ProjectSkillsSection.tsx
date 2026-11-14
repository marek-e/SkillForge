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
import { colors, palette } from '@/styles/tokens.stylex'

const styles = stylex.create({
  // `space-y-2`, a child rule (`:where(& > :not(:last-child))`) that emits both
  // block margins, the start one at zero (`tailwind-values.md` §7). Both
  // children - the header row and the list - are rendered here.
  section: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '0.5rem' },
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
                  <CheckIcon
                    className={[
                      'size-explicit',
                      stylex.props(overrideStyles.ICON_COPIED_CLASSES).className,
                    ].join(' ')}
                  />
                ) : (
                  <ClipboardCopyIcon
                    className={[
                      'size-explicit',
                      stylex.props(overrideStyles.ICON_MUTED_CLASSES).className,
                    ].join(' ')}
                  />
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
                <ExternalLinkIcon
                  className={[
                    'size-explicit',
                    stylex.props(overrideStyles.ICON_MUTED_CLASSES).className,
                  ].join(' ')}
                />
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
                  <BookmarkCheck
                    className={[
                      'size-explicit',
                      stylex.props(overrideStyles.ICON_SAVED_CLASSES).className,
                    ].join(' ')}
                  />
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
                <BookmarkPlusIcon
                  className={[
                    'size-explicit',
                    stylex.props(overrideStyles.ICON_MUTED_CLASSES).className,
                  ].join(' ')}
                />
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
          <Badge variant="secondary" sx={overrideStyles.COUNT_BADGE_CLASSES}>
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
              <BookmarkPlusIcon
                className={[
                  'size-explicit',
                  stylex.props(overrideStyles.SAVE_ALL_ICON_CLASS).className,
                ].join(' ')}
              />
              Save all
            </Button>
          )}
          <DisplayViewSwitch value={viewMode} onChange={handleViewModeChange} />
        </div>
      </div>

      {rows.length === 0 ? (
        <p {...stylex.props(styles.emptyText)}>No skills found in this project</p>
      ) : (
        <div {...stylex.props(viewMode === 'grid' ? styles.grid : overrideStyles.LIST_CLASSES)}>
          {rows.map(({ skill, toolName }) => {
            const config = getToolConfig(toolName)
            return (
              <SkillCard
                key={`${toolName}:${skill.name}`}
                viewMode={viewMode}
                name={skill.name}
                description={skill.description}
                badges={
                  <Badge variant="outline" sx={overrideStyles.TOOL_BADGE_CLASSES}>
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

const overrideStyles = stylex.create({
  LIST_CLASSES: {
    borderTopWidth: { default: null, ':is(*)>:not(:last-child)': '0px' },
    borderBottomWidth: { default: null, ':is(*)>:not(:last-child)': '1px' },
    borderBottomStyle: { default: null, ':is(*)>:not(:last-child)': 'solid' },
    borderColor: { default: null, ':is(*)>:not(:last-child)': colors.border },
  },
  COUNT_BADGE_CLASSES: { fontSize: '0.75rem', lineHeight: '1rem' },
  TOOL_BADGE_CLASSES: {
    fontSize: '0.75rem',
    lineHeight: '1rem',
    gap: '0.25rem',
    paddingLeft: '0.375rem',
    paddingRight: '0.375rem',
    paddingTop: '0rem',
    paddingBottom: '0rem',
  },
  SAVE_ALL_ICON_CLASS: { width: '0.75rem', height: '0.75rem' },
  ICON_COPIED_CLASSES: { width: '0.875rem', height: '0.875rem', color: palette.green500 },
  ICON_SAVED_CLASSES: { width: '0.875rem', height: '0.875rem', color: palette.green500 },
  ICON_MUTED_CLASSES: { width: '0.875rem', height: '0.875rem', color: colors.mutedForeground },
})
