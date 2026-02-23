import { LayoutGridIcon, LayoutListIcon } from 'lucide-react'
import type { SkillViewMode } from '@/lib/skill-view'
import { cn } from '@/lib/utils'

interface DisplayViewSwitchProps {
  value: SkillViewMode
  onChange: (mode: SkillViewMode) => void
}

export function DisplayViewSwitch({ value, onChange }: DisplayViewSwitchProps) {
  return (
    <div role="group" className="relative inline-flex items-center bg-muted rounded-lg p-[3px]">
      {/* sliding pill */}
      <div
        aria-hidden
        className={cn(
          'absolute top-[3px] bottom-[3px] left-[3px] w-7 rounded-md bg-background shadow-sm',
          'transition-transform duration-200 ease-in-out',
          value === 'grid' && 'translate-x-full'
        )}
      />
      <button
        type="button"
        aria-pressed={value === 'list'}
        aria-label="List view"
        onClick={() => onChange('list')}
        className={cn(
          'relative z-10 inline-flex size-7 items-center justify-center rounded-md transition-colors duration-200',
          value === 'list' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        )}
        title="List"
      >
        <LayoutListIcon className="size-3.5" />
      </button>
      <button
        type="button"
        aria-pressed={value === 'grid'}
        aria-label="Grid view"
        onClick={() => onChange('grid')}
        className={cn(
          'relative z-10 inline-flex size-7 items-center justify-center rounded-md transition-colors duration-200',
          value === 'grid' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        )}
        title="Grid"
      >
        <LayoutGridIcon className="size-3.5" />
      </button>
    </div>
  )
}
