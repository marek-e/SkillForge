import * as stylex from '@stylexjs/stylex'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * `space-y-2`, a child rule (`:where(& > :not(:last-child))`) that emits both
 * block margins, the start one at zero (`tailwind-values.md` §7). The children
 * are the `Label` and the `Input`, neither of which declares a block margin.
 */
const styles = stylex.create({
  field: {
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '0.5rem',
    },
  },
})

interface RenameProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  onNameChange: (name: string) => void
  onSubmit: () => void
  isPending: boolean
}

export function RenameProjectDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  onSubmit,
  isPending,
}: RenameProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>Update the project name shown in your workspace.</DialogDescription>
        </DialogHeader>
        <div {...stylex.props(styles.field)}>
          <Label htmlFor="rename-input">Project name</Label>
          <Input
            id="rename-input"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSubmit()
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isPending || !name.trim()}>
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
