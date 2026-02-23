import { WrenchIcon } from 'lucide-react'
import type { SkillViewMode } from '@/lib/skill-view'
import { cn } from '@/lib/utils'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SkillCardProps {
  viewMode: SkillViewMode
  name: string
  description: string
  badges?: React.ReactNode
  actions?: React.ReactNode
  onClick?: () => void
}

export function SkillCard({
  viewMode,
  name,
  description,
  badges,
  actions,
  onClick,
}: SkillCardProps) {
  if (viewMode === 'grid') {
    return (
      <Card
        size="sm"
        className={cn(onClick && 'cursor-pointer hover:ring-foreground/20 transition-shadow')}
        onClick={onClick}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WrenchIcon className="size-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{name}</span>
          </CardTitle>
          {actions && <CardAction>{actions}</CardAction>}
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          {badges && <div className="flex flex-wrap gap-1">{badges}</div>}
        </CardContent>
      </Card>
    )
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 py-2.5',
        onClick && 'cursor-pointer hover:bg-muted/50 -mx-2 px-2'
      )}
      onClick={onClick}
    >
      <WrenchIcon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{name}</span>
          {badges}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actions}
    </div>
  )
}
