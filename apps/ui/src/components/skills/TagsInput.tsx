import { useState, useRef } from 'react'
import * as stylex from '@stylexjs/stylex'
import { XIcon } from 'lucide-react'

import { colors, fonts, motion, radius } from '@/styles/tokens.stylex'

/** `transition-colors`, copied verbatim (`tailwind-values.md` §8, as `input.tsx`). */
const TRANSITION_COLORS =
  'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to'

/** `focus-within:ring-3` with `focus-within:ring-ring/50` (see `combobox.tsx`). */
const RING_FOCUS =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent), 0 0 #0000'

/** `shadow-md` layered under `ring-1 ring-foreground/10`, as one composed chain. */
const RING_1_SHADOW_MD =
  '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent), 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'

const styles = stylex.create({
  // `relative`
  root: {
    position: 'relative',
  },

  // `border-input focus-within:border-ring focus-within:ring-ring/50 flex
  //  min-h-8 flex-wrap items-center gap-1 rounded-lg border bg-transparent
  //  px-2.5 py-1 text-sm transition-colors focus-within:ring-3`
  box: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.25rem',
    minHeight: '2rem',
    // `px-*`/`py-*` are the logical properties; a physical `pl-*` would still
    // resolve over them, exactly as today (`conventions.md`).
    paddingInline: '0.625rem',
    paddingBlock: '0.25rem',
    borderRadius: radius.lg,
    // `border`: the width and the style only. The colour below replaces the
    // `*` rule in `@layer base` for both states.
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: { default: colors.input, ':focus-within': colors.ring },
    backgroundColor: 'transparent',
    boxShadow: { default: null, ':focus-within': RING_FOCUS },
    // `text-sm`, as the pair of lengths it resolves to. This component renders
    // every one of its own descendants and takes no children: the tag span and
    // the suggestion button carry a `text-*` of their own, and the bare `input`
    // inherits the same 14px font size, against which Tailwind's ratio resolves
    // to exactly the 20px this length passes down.
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    transitionProperty: TRANSITION_COLORS,
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
  },

  // `bg-muted text-foreground flex items-center gap-1 rounded-sm px-1.5
  //  font-mono text-xs font-medium whitespace-nowrap`, plus the arbitrary
  // height utility, which adds a one-unit spacing step to a five-unit one and
  // resolves to the 24px written below.
  tag: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    height: 'calc(1.25rem + 0.25rem)',
    paddingInline: '0.375rem',
    borderRadius: radius.sm,
    backgroundColor: colors.muted,
    color: colors.foreground,
    fontFamily: fonts.mono,
    fontSize: '0.75rem',
    lineHeight: '1rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },

  // `text-muted-foreground hover:text-foreground -mr-0.5 ml-0.5`
  tagRemove: {
    color: {
      default: colors.mutedForeground,
      '@media (hover: hover)': { default: null, ':hover': colors.foreground },
    },
    // `-mr-*`/`ml-*` are the physical longhands Tailwind emits here.
    marginRight: '-0.125rem',
    marginLeft: '0.125rem',
  },

  // `size-3`
  tagRemoveIcon: {
    width: '0.75rem',
    height: '0.75rem',
  },

  // `min-w-16 flex-1 bg-transparent outline-none
  //  placeholder:text-muted-foreground`
  input: {
    minWidth: '4rem',
    // `flex-1` is `flex: 1 1 0%`, written as the three longhands it expands to.
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    backgroundColor: 'transparent',
    // `outline-none` also sets `--tw-outline-style: none`, which nothing here
    // reads back.
    outlineStyle: 'none',
    '::placeholder': {
      color: colors.mutedForeground,
    },
  },

  // `bg-popover ring-foreground/10 absolute top-full z-50 mt-1 w-full
  //  overflow-hidden rounded-lg shadow-md ring-1`
  suggestions: {
    position: 'absolute',
    top: '100%',
    zIndex: 50,
    marginTop: '0.25rem',
    width: '100%',
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: colors.popover,
    boxShadow: RING_1_SHADOW_MD,
  },

  // `text-popover-foreground hover:bg-accent hover:text-accent-foreground
  //  w-full px-3 py-1.5 text-left font-mono text-sm`
  suggestion: {
    width: '100%',
    paddingInline: '0.75rem',
    paddingBlock: '0.375rem',
    textAlign: 'left',
    fontFamily: fonts.mono,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: {
      default: colors.popoverForeground,
      '@media (hover: hover)': { default: null, ':hover': colors.accentForeground },
    },
    backgroundColor: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': colors.accent },
    },
  },
})

interface TagsInputProps {
  id?: string
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
}

export function TagsInput({ id, value, onChange, suggestions = [] }: TagsInputProps) {
  const [tagInput, setTagInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const suggestionListRef = useRef<HTMLUListElement>(null)
  // Tracks whether focus is moving to the suggestion list so the blur handler
  // doesn't flush the in-progress input as a new tag prematurely.
  const movingToSuggestionsRef = useRef(false)

  const normalizedInput = tagInput.trim().replace(/^#+/, '').toLowerCase()
  const filteredSuggestions = normalizedInput
    ? suggestions.filter((t) => t.toLowerCase().includes(normalizedInput) && !value.includes(t))
    : []

  function addTag(raw: string) {
    const normalized = raw.trim().replace(/^#+/, '')
    if (normalized && !value.includes(normalized)) {
      onChange([...value, normalized])
    }
    setTagInput('')
    setShowSuggestions(false)
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      movingToSuggestionsRef.current = true
      suggestionListRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    } else if (e.key === 'Backspace' && tagInput === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function handleSuggestionKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    tag: string,
    index: number
  ) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      addTag(tag)
      tagInputRef.current?.focus()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      tagInputRef.current?.focus()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const items = suggestionListRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []
      items[index + 1]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (index === 0) {
        movingToSuggestionsRef.current = false
        tagInputRef.current?.focus()
      } else {
        const items = suggestionListRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []
        items[index - 1]?.focus()
      }
    }
  }

  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.box)} onClick={() => tagInputRef.current?.focus()}>
        {value.map((tag) => (
          <span key={tag} {...stylex.props(styles.tag)}>
            #{tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              {...stylex.props(styles.tagRemove)}
              aria-label={`Remove tag ${tag}`}
            >
              <XIcon {...stylex.props(styles.tagRemoveIcon)} />
            </button>
          </span>
        ))}
        <input
          ref={tagInputRef}
          id={id}
          type="text"
          value={tagInput}
          onChange={(e) => {
            setTagInput(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setTimeout(() => {
              // Skip flush if focus moved to the suggestion list (ArrowDown navigation)
              if (movingToSuggestionsRef.current) {
                movingToSuggestionsRef.current = false
                return
              }
              setShowSuggestions(false)
              if (tagInput.trim()) addTag(tagInput)
            }, 150)
          }}
          onKeyDown={handleTagKeyDown}
          placeholder={value.length === 0 ? 'e.g. ai, automation' : ''}
          {...stylex.props(styles.input)}
        />
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul ref={suggestionListRef} {...stylex.props(styles.suggestions)}>
          {filteredSuggestions.map((tag, index) => (
            <li key={tag}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  addTag(tag)
                  tagInputRef.current?.focus()
                }}
                onKeyDown={(e) => handleSuggestionKeyDown(e, tag, index)}
                {...stylex.props(styles.suggestion)}
              >
                #{tag}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
