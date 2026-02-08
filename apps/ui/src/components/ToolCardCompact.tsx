import type { ToolStatus } from '@skillforge/core'
import { useNavigate } from '@tanstack/react-router'
import { DownloadIcon, EllipsisIcon } from 'lucide-react'
import { Card } from './ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ToolConfig {
  displayName: string
  logo: string
  accent: string
  invert?: boolean
  url?: string
}

const toolConfig: Record<string, ToolConfig> = {
  'claude-code': {
    displayName: 'Claude Code',
    logo: '/tools/claude-color.svg',
    accent: 'bg-orange-500/15',
    invert: false,
    url: 'https://claude.com/product/claude-code',
  },
  cursor: {
    displayName: 'Cursor',
    logo: '/tools/cursor.svg',
    accent: 'bg-blue-500/15',
    invert: true,
    url: 'https://cursor.com/download',
  },
  codex: {
    displayName: 'Codex',
    logo: '/tools/openai.svg',
    accent: 'bg-purple-500/15',
    invert: true,
    url: 'https://developers.openai.com/codex/cli',
  },
  'gemini-cli': {
    displayName: 'Gemini CLI',
    logo: '/tools/gemini-color.svg',
    accent: 'bg-cyan-500/15',
    invert: false,
    url: 'https://geminicli.com/',
  },
  opencode: {
    displayName: 'OpenCode',
    logo: '/tools/opencode-logo-light.svg',
    accent: 'bg-green-500/15',
    invert: true,
    url: 'https://opencode.ai/',
  },
}

export function getToolConfig(name: string): ToolConfig {
  return (
    toolConfig[name] ?? {
      displayName: name,
      logo: '',
      accent: 'bg-muted',
      invert: false,
      url: undefined,
    }
  )
}

interface ToolCardCompactProps {
  tool: ToolStatus
}

export function ToolCardCompact({ tool }: ToolCardCompactProps) {
  const config = getToolConfig(tool.name)
  const navigate = useNavigate()
  const detected = tool.detected

  function handleClick() {
    if (detected) {
      navigate({ to: '/tools/$name', params: { name: tool.name } })
    }
  }

  return (
    <Card
      size="sm"
      {...(detected && {
        role: 'link',
        tabIndex: 0,
        onClick: handleClick,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        },
      })}
      className={cn(
        'relative w-full select-none transition-all duration-200',
        detected
          ? 'cursor-pointer hover:-translate-y-0.5 hover:ring-foreground/20 hover:shadow-md'
          : 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between px-4 pt-1">
        <div className={cn('flex size-10 items-center justify-center rounded-lg', config.accent)}>
          <img
            src={config.logo}
            alt={config.displayName}
            className={cn('size-6', config.invert && 'dark:invert')}
          />
        </div>
        <div className="flex items-center gap-2 pt-1">
          {!detected && config.url && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <EllipsisIcon className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => window.open(config.url, '_blank', 'noopener,noreferrer')}
                >
                  <DownloadIcon />
                  Download
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <span
            className={cn(
              'inline-block size-2.5 rounded-full',
              detected
                ? 'bg-emerald-500 shadow-[0_0_6px_2px_rgba(16,185,129,0.4)] animate-pulse'
                : 'bg-muted-foreground/40'
            )}
          />
        </div>
      </div>

      <div className="px-4 pb-1">
        <p className="text-base font-semibold text-foreground">{config.displayName}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {detected ? (
            <>
              {tool.skillCount} skill{tool.skillCount !== 1 && 's'}
              {tool.commandCount > 0 && (
                <>
                  {' \u00B7 '}
                  {tool.commandCount} command{tool.commandCount !== 1 && 's'}
                </>
              )}
            </>
          ) : (
            'Not detected'
          )}
        </p>
      </div>
    </Card>
  )
}
