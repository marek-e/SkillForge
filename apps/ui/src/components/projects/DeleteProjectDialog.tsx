import type { Project } from '@skillforge/core'
import * as stylex from '@stylexjs/stylex'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

const styles = stylex.create({
  // `font-bold`
  name: {
    fontWeight: 700,
  },
})

interface DeleteProjectDialogProps {
  project: Project | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
}

export function DeleteProjectDialog({
  project,
  onOpenChange,
  onConfirm,
  isPending,
}: DeleteProjectDialogProps) {
  return (
    <Dialog open={!!project} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project?</DialogTitle>
          <DialogDescription>
            This will remove <span {...stylex.props(styles.name)}>{project?.name}</span> from your
            project list.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !project}
            onClick={onConfirm}
          >
            {isPending ? 'Deleting...' : 'Delete project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
