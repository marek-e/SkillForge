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
import { getToolConfig } from '@/lib/tool-config'

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
