import { useEffect, useRef } from 'react'
import { SearchIcon, XIcon } from 'lucide-react'
import { getToolConfig } from '@/lib/tool-config'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

interface Props {
  searchQuery: string
  onSearchChange: (q: string) => void
  availableTools: string[]
  selectedTools: string[]
  onToolToggle: (tool: string) => void
}

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)

export function ProjectsFilterBar({
  searchQuery,
  onSearchChange,
  availableTools,
  selectedTools,
  onToolToggle,
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
    <div className="flex items-center gap-3">
      <InputGroup className="w-64">
        <InputGroupAddon align="inline-start">
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          placeholder="Search projects..."
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
            <kbd className="text-muted-foreground rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
              {isMac ? '⌘F' : 'Ctrl F'}
            </kbd>
          </InputGroupAddon>
        )}
      </InputGroup>

      {availableTools.length > 0 && (
        <div className="flex items-center gap-1.5">
          {availableTools.map((tool) => {
            const config = getToolConfig(tool)
            const isActive = selectedTools.includes(tool)
            return (
              <Button
                key={tool}
                variant={isActive ? 'secondary' : 'outline'}
                size="sm"
                className="h-8 text-xs"
                onClick={() => onToolToggle(tool)}
              >
                {config.displayName}
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}
