import { useState } from 'react'
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  FolderIcon,
  FolderOpenIcon,
  ImageIcon,
  RefreshCwIcon,
} from 'lucide-react'
import type { Project } from '@skillforge/core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getToolConfig } from '@/lib/tool-config'
import { isElectron, getElectronAPI } from '@/lib/electron'
import { cn } from '@/lib/utils'

interface ProjectOverviewCardProps {
  project: Project
  iconPath: string
  onIconPathChange: (value: string) => void
  onApplyIcon: (value: string | null) => void
  isIconPending: boolean
  onRefreshTools: () => void
  isRefreshing: boolean
}

export function ProjectOverviewCard({
  project,
  iconPath,
  onIconPathChange,
  onApplyIcon,
  isIconPending,
  onRefreshTools,
  isRefreshing,
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

  const detectedTools = project.detectedTools.filter((t) => t.detected)

  return (
    <div className="border rounded-xl divide-y overflow-hidden bg-card">
      <div className="flex items-center px-4 py-2.5 gap-3">
        <span className="w-20 text-sm text-muted-foreground shrink-0">Directory</span>
        <FolderIcon className="size-4 text-muted-foreground shrink-0" />
        <p className="flex-1 min-w-0 font-mono text-sm truncate">{project.path}</p>
        <div className="ml-auto flex items-center gap-0.5 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-foreground"
                onClick={handleCopyPath}
              >
                {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
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
                    <FolderOpenIcon className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reveal in Finder</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => getElectronAPI()?.openInEditor(project.path)}
                  >
                    <ExternalLinkIcon className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open in editor</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center px-4 py-2.5 gap-3">
        <span className="w-20 text-sm text-muted-foreground shrink-0">Icon</span>
        <div
          className={cn(
            'size-7 shrink-0 overflow-hidden flex items-center justify-center bg-muted border border-border/50',
            iconPath ? 'rounded-none' : 'rounded-md'
          )}
        >
          {iconPath ? (
            <img src={iconPath} alt="Project icon" className="size-full object-contain" />
          ) : (
            <ImageIcon className="size-3.5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
          {isElectron ? (
            <>
              <span className="text-sm text-muted-foreground">
                {iconPath ? 'Custom image' : 'No icon'}
              </span>
              <div className="flex items-center gap-2">
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
              className="flex-1"
            />
          )}
        </div>
      </div>

      {pickerError && (
        <div className="px-4 py-2">
          <p className="text-destructive text-sm">{pickerError}</p>
        </div>
      )}

      <div className="flex items-center px-4 py-2.5 gap-3">
        <span className="w-20 text-sm text-muted-foreground shrink-0">Tools</span>
        <div className="flex-1 min-w-0 flex flex-wrap gap-1.5">
          {detectedTools.length > 0 ? (
            detectedTools.map((t) => {
              const config = getToolConfig(t.name)
              return (
                <Badge key={t.name} variant="outline" className="gap-1.5">
                  {config.logo && (
                    <img
                      src={config.logo}
                      alt={config.displayName}
                      className={cn('size-3.5', config.invert && 'dark:invert')}
                    />
                  )}
                  {config.displayName}
                </Badge>
              )
            })
          ) : (
            <span className="text-sm text-muted-foreground">No tools detected</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onRefreshTools}
          disabled={isRefreshing}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          <RefreshCwIcon className={cn('size-3.5', isRefreshing && 'animate-spin')} />
        </Button>
      </div>
    </div>
  )
}
