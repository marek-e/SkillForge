import { useState } from 'react'
import * as stylex from '@stylexjs/stylex'
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  FolderIcon,
  FolderOpenIcon,
  ImageIcon,
} from 'lucide-react'
import type { Project } from '@skillforge/core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getToolConfig } from '@/lib/tool-config'
import { isElectron, getElectronAPI } from '@/lib/electron'
import { getDefaultEditor, getCustomEditorCmd } from '@/lib/editor-settings'
import { EditorSelect } from '@/components/EditorSelect'
import { colors, fonts, radius } from '@/styles/tokens.stylex'

const styles = stylex.create({
  // `border rounded-xl divide-y overflow-hidden bg-card`.
  //
  // `border` is `1px` plus `var(--tw-border-style)`, whose registered initial
  // value is `solid`; the colour keeps coming from the `*` rule in
  // `@layer base`, which no StyleX layer contests (`tailwind-values.md` §5).
  //
  // `divide-y` is a child rule (`:where(& > :not(:last-child))`) that sets both
  // block border widths - the top one at zero - and both styles. Its children
  // are the rows this file renders below, none of which declares a border.
  card: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.card,
    ':is(*)>:not(:last-child)': {
      borderTopStyle: 'solid',
      borderBottomStyle: 'solid',
      borderTopWidth: '0px',
      borderBottomWidth: '1px',
    },
  },
  // `flex items-center px-4 py-2.5 gap-3`; `px-*`/`py-*` are logical, as
  // Tailwind writes them, so a physical `pt-*`/`pl-*` keeps resolving over them.
  row: {
    display: 'flex',
    alignItems: 'center',
    paddingInline: '1rem',
    paddingBlock: '0.625rem',
    gap: '0.75rem',
  },
  // `w-20 text-sm text-muted-foreground shrink-0`; the paired line height is
  // written as the length it resolves to, and the span holds nothing but text.
  rowLabel: {
    width: '5rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  // `size-4 text-muted-foreground shrink-0` on the folder icon. This one is not
  // inside a `Button`, so no `[class*='size-']` rule reads its class attribute.
  pathIcon: {
    width: '1rem',
    height: '1rem',
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  // `flex-1 min-w-0 font-mono text-sm truncate`
  pathText: {
    flex: 1,
    minWidth: '0rem',
    fontFamily: fonts.mono,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // `ml-auto flex items-center gap-0.5 shrink-0`
  pathActions: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '0.125rem',
    flexShrink: 0,
  },
  // `size-7 shrink-0 overflow-hidden flex items-center justify-center bg-muted
  //  border border-border/50`
  iconBox: {
    width: '1.75rem',
    height: '1.75rem',
    flexShrink: 0,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.muted,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 50%, transparent)',
  },
  // `rounded-md`
  iconBoxEmpty: {
    borderRadius: radius.md,
  },
  // `rounded-none`
  iconBoxFilled: {
    borderRadius: '0px',
  },
  // `size-full object-contain`
  iconImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  // `size-3.5 text-muted-foreground` on the placeholder icon (not inside a
  // `Button`).
  iconPlaceholder: {
    width: '0.875rem',
    height: '0.875rem',
    color: colors.mutedForeground,
  },
  // `flex-1 min-w-0 flex items-center justify-between gap-2`
  iconBody: {
    flex: 1,
    minWidth: '0rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
  },
  // `text-sm text-muted-foreground`
  mutedText: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: colors.mutedForeground,
  },
  // `flex items-center gap-2`
  iconButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  // `px-4 py-2`
  errorRow: {
    paddingInline: '1rem',
    paddingBlock: '0.5rem',
  },
  // `text-destructive text-sm`
  errorText: {
    color: colors.destructive,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  // `flex-1 min-w-0 flex flex-wrap gap-1.5`
  toolsList: {
    flex: 1,
    minWidth: '0rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  // `size-3.5` on the tool logo. The logo is an `<img>` inside a `Badge`, whose
  // only icon rule is `[&>svg]:size-3!` - an `img` never matches it - so this
  // size is uncontested.
  toolLogo: {
    width: '0.875rem',
    height: '0.875rem',
  },
  // `dark:invert`. Tailwind's `invert` sets `--tw-invert: invert(100%)` inside
  // a `filter` chain whose other slots are empty, so the computed filter is
  // that one function (`tailwind-values.md` §8); lightningcss writes it out as
  // `invert()` (PR 22).
  toolLogoInverted: {
    filter: { default: null, ':is(.dark *)': 'invert(100%)' },
  },
})

/**
 * The copy button's override, passed through `Button`'s `sx` prop (PR 05).
 *
 * `text-muted-foreground hover:text-foreground` restates what `variant="ghost"`
 * already declares, so the pair was redundant even before this row. It is kept
 * rather than dropped, because `stylex.props` merges a property as a whole and
 * the plain `text-muted-foreground` utility already shadowed `ghost`'s
 * `aria-expanded:text-foreground` arm: leaving that arm out here is what keeps
 * the computed colour identical.
 */
const buttonStyles = stylex.create({
  copyAction: {
    color: {
      default: colors.mutedForeground,
      '@media (hover: hover)': { default: null, ':hover': colors.foreground },
    },
  },
})

/**
 * Overrides that still have to travel as class strings (removed in PR 32).
 *
 * - `EditorSelect` takes `triggerClassName` / `inputClassName` **props**, not a
 *   `className`; it is still a Tailwind component (PR 21 migrates it), so these
 *   two strings stay strings.
 * - `Badge` and `Input` take no `sx` prop - `className` is the only channel
 *   into them.
 * - `size-3.5` on the three action icons: they sit inside `icon-xs` `Button`s,
 *   whose `[&_svg:not([class*='size-'])]:size-3` reads the child's `class`
 *   **attribute text**. A StyleX hash would stop matching and the button would
 *   render them at 12px (`button.tsx`, PR 04; `conventions.md`, "A class name
 *   can itself be the contract").
 */

interface ProjectOverviewCardProps {
  project: Project
  iconPath: string
  onIconPathChange: (value: string) => void
  onApplyIcon: (value: string | null) => void
  isIconPending: boolean
  onEditorChange: (editor: string, customCmd: string) => void
}

export function ProjectOverviewCard({
  project,
  iconPath,
  onIconPathChange,
  onApplyIcon,
  isIconPending,
  onEditorChange,
}: ProjectOverviewCardProps) {
  const [pickerError, setPickerError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleBrowse() {
    const result = await getElectronAPI()?.openFileDialog(project.path)
    if (!result) return
    if ('error' in result) {
      setPickerError(result.error)
      return
    }
    setPickerError(null)
    onIconPathChange(result.dataUrl)
    onApplyIcon(result.dataUrl)
  }

  function handleCopyPath() {
    void navigator.clipboard.writeText(project.path)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleRemove() {
    setPickerError(null)
    onIconPathChange('')
    onApplyIcon(null)
  }

  function handleOpenInEditor() {
    const effectiveEditor = project.preferredEditor ?? getDefaultEditor()
    const cmd =
      effectiveEditor === 'custom'
        ? (project.customEditorCmd ?? getCustomEditorCmd())
        : effectiveEditor
    getElectronAPI()?.openInEditor(project.path, cmd === 'auto' ? undefined : cmd)
  }

  const detectedTools = project.detectedTools.filter((t) => t.detected)

  return (
    <div {...stylex.props(styles.card)}>
      <div {...stylex.props(styles.row)}>
        <span {...stylex.props(styles.rowLabel)}>Directory</span>
        <FolderIcon {...stylex.props(styles.pathIcon)} />
        <p {...stylex.props(styles.pathText)}>{project.path}</p>
        <div {...stylex.props(styles.pathActions)}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                sx={buttonStyles.copyAction}
                onClick={handleCopyPath}
              >
                {copied ? (
                  <CheckIcon
                    className={[
                      'size-explicit',
                      stylex.props(overrideStyles.ACTION_ICON_SIZE_CLASS).className,
                    ].join(' ')}
                  />
                ) : (
                  <CopyIcon
                    className={[
                      'size-explicit',
                      stylex.props(overrideStyles.ACTION_ICON_SIZE_CLASS).className,
                    ].join(' ')}
                  />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy path</TooltipContent>
          </Tooltip>

          {isElectron && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => getElectronAPI()?.revealInFinder(project.path)}
                  >
                    <FolderOpenIcon
                      className={[
                        'size-explicit',
                        stylex.props(overrideStyles.ACTION_ICON_SIZE_CLASS).className,
                      ].join(' ')}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reveal in Finder</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-xs" onClick={handleOpenInEditor}>
                    <ExternalLinkIcon
                      className={[
                        'size-explicit',
                        stylex.props(overrideStyles.ACTION_ICON_SIZE_CLASS).className,
                      ].join(' ')}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open in editor</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      <div {...stylex.props(styles.row)}>
        <span {...stylex.props(styles.rowLabel)}>Editor</span>
        <EditorSelect
          value={project.preferredEditor}
          customCmd={project.customEditorCmd ?? ''}
          onChange={onEditorChange}
          triggerSx={overrideStyles.EDITOR_TRIGGER_CLASSES}
          inputSx={overrideStyles.EDITOR_INPUT_CLASSES}
        />
      </div>

      <div {...stylex.props(styles.row)}>
        <span {...stylex.props(styles.rowLabel)}>Icon</span>
        <div
          {...stylex.props(styles.iconBox, iconPath ? styles.iconBoxFilled : styles.iconBoxEmpty)}
        >
          {iconPath ? (
            <img src={iconPath} alt="Project icon" {...stylex.props(styles.iconImage)} />
          ) : (
            <ImageIcon {...stylex.props(styles.iconPlaceholder)} />
          )}
        </div>
        <div {...stylex.props(styles.iconBody)}>
          {isElectron ? (
            <>
              <span {...stylex.props(styles.mutedText)}>
                {iconPath ? 'Custom image' : 'No icon'}
              </span>
              <div {...stylex.props(styles.iconButtons)}>
                <Button variant="outline" size="sm" onClick={handleBrowse} disabled={isIconPending}>
                  {isIconPending ? 'Saving…' : 'Change'}
                </Button>
                {iconPath && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isIconPending}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </>
          ) : (
            <Input
              value={iconPath}
              onChange={(e) => onIconPathChange(e.target.value)}
              onBlur={(e) => onApplyIcon(e.target.value.trim() || null)}
              placeholder="https://example.com/logo.svg"
              disabled={isIconPending}
              sx={overrideStyles.INPUT_CLASSES}
            />
          )}
        </div>
      </div>

      {pickerError && (
        <div {...stylex.props(styles.errorRow)}>
          <p {...stylex.props(styles.errorText)}>{pickerError}</p>
        </div>
      )}

      <div {...stylex.props(styles.row)}>
        <span {...stylex.props(styles.rowLabel)}>Tools</span>
        <div {...stylex.props(styles.toolsList)}>
          {detectedTools.length > 0 ? (
            detectedTools.map((t) => {
              const config = getToolConfig(t.name)
              return (
                <Badge key={t.name} variant="outline" sx={overrideStyles.BADGE_CLASSES}>
                  {config.logo && (
                    <img
                      src={config.logo}
                      alt={config.displayName}
                      {...stylex.props(styles.toolLogo, config.invert && styles.toolLogoInverted)}
                    />
                  )}
                  {config.displayName}
                </Badge>
              )
            })
          ) : (
            <span {...stylex.props(styles.mutedText)}>No tools detected</span>
          )}
        </div>
      </div>
    </div>
  )
}

const overrideStyles = stylex.create({
  EDITOR_TRIGGER_CLASSES: { width: '160px' },
  EDITOR_INPUT_CLASSES: { height: '1.75rem', width: '140px' },
  BADGE_CLASSES: { gap: '0.375rem' },
  INPUT_CLASSES: { flexGrow: 1, flexShrink: 1, flexBasis: '0%' },
  ACTION_ICON_SIZE_CLASS: { width: '0.875rem', height: '0.875rem' },
})
