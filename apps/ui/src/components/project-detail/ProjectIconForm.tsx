import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProjectIconFormProps {
  iconPath: string
  onIconPathChange: (value: string) => void
  onSave: () => void
  isPending: boolean
}

export function ProjectIconForm({
  iconPath,
  onIconPathChange,
  onSave,
  isPending,
}: ProjectIconFormProps) {
  return (
    <div className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="project-icon">Icon path</Label>
        <Input
          id="project-icon"
          value={iconPath}
          onChange={(e) => onIconPathChange(e.target.value)}
          placeholder="logo.svg"
        />
      </div>
      <Button onClick={onSave} disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </Button>
    </div>
  )
}
