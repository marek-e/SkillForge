import type { Skill } from '@skillforge/core'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DeleteSkillDialogProps {
  skill: Skill | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
}

export function DeleteSkillDialog({
  skill,
  onOpenChange,
  onConfirm,
  isPending,
}: DeleteSkillDialogProps) {
  return (
    <Dialog open={!!skill} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove skill from library?</DialogTitle>
          <DialogDescription>
            This will remove <span className="font-bold">{skill?.name}</span> from your library. The
            original skill files will not be deleted.
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
            disabled={isPending || !skill}
            onClick={onConfirm}
          >
            {isPending ? 'Removing...' : 'Remove from library'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
