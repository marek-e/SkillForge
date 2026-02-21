import { useState, useRef } from 'react'
import { XIcon } from 'lucide-react'

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
    <div className="relative">
      <div
        className="border-input focus-within:border-ring focus-within:ring-ring/50 flex min-h-8 flex-wrap items-center gap-1 rounded-lg border bg-transparent px-2.5 py-1 text-sm transition-colors focus-within:ring-3"
        onClick={() => tagInputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="bg-muted text-foreground flex h-[calc(--spacing(5)+(--spacing(1)))] items-center gap-1 rounded-sm px-1.5 font-mono text-xs font-medium whitespace-nowrap"
          >
            #{tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              className="text-muted-foreground hover:text-foreground -mr-0.5 ml-0.5"
              aria-label={`Remove tag ${tag}`}
            >
              <XIcon className="size-3" />
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
          className="min-w-16 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul
          ref={suggestionListRef}
          className="bg-popover ring-foreground/10 absolute top-full z-50 mt-1 w-full overflow-hidden rounded-lg shadow-md ring-1"
        >
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
                className="text-popover-foreground hover:bg-accent hover:text-accent-foreground w-full px-3 py-1.5 text-left font-mono text-sm"
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
