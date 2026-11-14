import { useState } from 'react'
import * as stylex from '@stylexjs/stylex'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { colors } from '@/styles/tokens.stylex'

/**
 * `space-y-*` is a child rule (`:where(& > :not(:last-child))`) that emits
 * **both** block margins, the start one at zero (`tailwind-values.md` §7). Both
 * stacks here hold elements this file renders plus `DialogFooter`, which is the
 * last child and so was never matched by the rule; it declares
 * `margin-inline`/`margin-bottom` of its own and no block margin the rule could
 * contest (`dialog.tsx`, PR 10).
 */
const styles = stylex.create({
  // `space-y-4`
  form: {
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '1rem',
    },
  },
  // `space-y-2`
  field: {
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '0.5rem',
    },
  },
  // `text-sm text-destructive`; the paired line height is written as the length
  // it resolves to, and the paragraph has no descendant that could inherit a
  // ratio instead (`conventions.md`, "Paired line-heights").
  error: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: colors.destructive,
  },
})

interface AddProjectWebDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (path: string) => void
  isPending: boolean
  error?: string
}

export function AddProjectWebDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  error,
}: AddProjectWebDialogProps) {
  const [path, setPath] = useState('')

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    onSubmit(path.trim())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} {...stylex.props(styles.form)}>
          <div {...stylex.props(styles.field)}>
            <Label htmlFor="project-path">Directory path</Label>
            <Input
              id="project-path"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/Users/you/projects/my-project"
              required
            />
          </div>
          {error && <p {...stylex.props(styles.error)}>{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adding...' : 'Add project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
