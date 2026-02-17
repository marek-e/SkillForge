import type { DetectedTool } from '@skillforge/core'
import { RefreshCwIcon } from 'lucide-react'
import { getToolConfig } from '@/lib/tool-config'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

interface DetectedToolsListProps {
  tools: DetectedTool[]
  onRefresh: () => void
  isRefreshing: boolean
}

export function DetectedToolsList({ tools, onRefresh, isRefreshing }: DetectedToolsListProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>Detected tools</Label>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCwIcon className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      {tools.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tools.map((t) => {
            const config = getToolConfig(t.name)
            return (
              <Badge key={t.name} variant="secondary">
                {config.displayName}
              </Badge>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No tools detected</p>
      )}
    </div>
  )
}
