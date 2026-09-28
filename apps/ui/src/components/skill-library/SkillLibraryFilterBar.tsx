import { useEffect, useRef } from 'react'
import * as stylex from '@stylexjs/stylex'
import { SearchIcon, XIcon } from 'lucide-react'
import type { SkillViewMode } from '@/lib/skill-view'
import { getToolConfig } from '@/lib/tool-config'
import { Button } from '@/components/ui/button'
import { DisplayViewSwitch } from '@/components/ui/display-view-switch'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { colors, fonts } from '@/styles/tokens.stylex'

const styles = stylex.create({
  // `flex flex-wrap items-center gap-3`
  bar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.75rem',
  },
  // `flex items-center gap-1.5`
  group: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  },
  // `ml-auto`
  trailing: {
    marginLeft: 'auto',
  },
  // `text-muted-foreground rounded bg-muted px-1 py-0.5 font-mono text-[10px]`.
  //
  // `rounded` bare is the built-in `0.25rem`, not the project's `--radius`
  // scale, and `px-*`/`py-*` are logical, as Tailwind writes them.
  //
  // **No `line-height`**: `text-[10px]` emits `line-height: var(--tw-leading)`
  // with no fallback, which is invalid at computed-value time, so the kbd
  // inherits the `InputGroupAddon`'s ratio instead. That addon keeps its
  // `text-sm` a Tailwind class for exactly this element (PR 05), and leaving
  // the property undeclared here reproduces the inheritance.
  kbd: {
    color: colors.mutedForeground,
    borderRadius: '0.25rem',
    backgroundColor: colors.muted,
    paddingInline: '0.25rem',
    paddingBlock: '0.125rem',
    fontFamily: fonts.mono,
    fontSize: '10px',
  },
})

/**
 * The filter buttons' own overrides, passed through `Button`'s `sx` prop (PR 22).
 *
 * `stylex.props` merges a property as a whole, so `fontSize` here would drop
 * `size="sm"`'s `lineHeight: inherit` along with its font size; both are
 * restated. `text-xs`' paired line height is written as the length it resolves
 * to (`0.75rem × calc(1 / 0.75)` = `1rem`), which is what the utility computed
 * to on these buttons.
 */
const buttonStyles = stylex.create({
  // `h-8 text-xs`
  filter: {
    height: '2rem',
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },
  // `font-mono`
  mono: {
    fontFamily: fonts.mono,
  },
})

/**
 * `w-64` on the search field, kept as a Tailwind class (removed in PR 32).
 *
 * `InputGroup` takes no `sx` prop — `className` is the only channel into it —
 * so this override stays a utility until that component drops its own
 * `className` bridge.
 */
const INPUT_GROUP_CLASSES = 'w-64'

interface Props {
  searchQuery: string
  onSearchChange: (q: string) => void
  availableTools: string[]
  selectedTools: string[]
  onToolToggle: (tool: string) => void
  availableTags: string[]
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  viewMode: SkillViewMode
  onViewModeChange: (mode: SkillViewMode) => void
}

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)

export function SkillLibraryFilterBar({
  searchQuery,
  onSearchChange,
  availableTools,
  selectedTools,
  onToolToggle,
  availableTags,
  selectedTags,
  onTagToggle,
  viewMode,
  onViewModeChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div {...stylex.props(styles.bar)}>
      <InputGroup className={INPUT_GROUP_CLASSES}>
        <InputGroupAddon align="inline-start">
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery ? (
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" onClick={() => onSearchChange('')}>
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        ) : (
          <InputGroupAddon align="inline-end">
            <kbd {...stylex.props(styles.kbd)}>{isMac ? '⌘F' : 'Ctrl F'}</kbd>
          </InputGroupAddon>
        )}
      </InputGroup>

      {availableTools.length > 0 && (
        <div {...stylex.props(styles.group)}>
          {availableTools.map((tool) => {
            const config = getToolConfig(tool)
            const isActive = selectedTools.includes(tool)
            return (
              <Button
                key={tool}
                variant={isActive ? 'secondary' : 'outline'}
                size="sm"
                sx={buttonStyles.filter}
                onClick={() => onToolToggle(tool)}
              >
                {config.displayName}
              </Button>
            )
          })}
        </div>
      )}

      {availableTags.length > 0 && (
        <div {...stylex.props(styles.group)}>
          {availableTags.map((tag) => {
            const isActive = selectedTags.includes(tag)
            const label = tag.startsWith('#') ? tag : `#${tag}`
            return (
              <Button
                key={tag}
                variant={isActive ? 'secondary' : 'outline'}
                size="sm"
                sx={[buttonStyles.filter, buttonStyles.mono]}
                onClick={() => onTagToggle(tag)}
              >
                {label}
              </Button>
            )
          })}
        </div>
      )}

      <div {...stylex.props(styles.trailing)}>
        <DisplayViewSwitch value={viewMode} onChange={onViewModeChange} />
      </div>
    </div>
  )
}
