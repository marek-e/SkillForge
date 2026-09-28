import { useState } from 'react'
import * as stylex from '@stylexjs/stylex'
import { useNavigate } from '@tanstack/react-router'
import type { SkillScope } from '@skillforge/core'
import { colors } from '@/styles/tokens.stylex'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateSkill, useAvailableTags } from '@/hooks/use-skill-library'
import { TagsInput } from './TagsInput'

/**
 * The four class lists that stay Tailwind (PR 32).
 *
 * `space-y-4` and `space-y-2` are child rules — `:where(& > :not(:last-child))`
 * — over the controls this form wraps rather than styles, so they keep the
 * specificity they have today. `sr-only` and `w-full` are caller overrides on
 * `DialogDescription` and `SelectTrigger`, neither of which takes an `sx` prop
 * yet, so both still arrive as a `className` that `cn` appends.
 */
const FORM_CLASSES = 'space-y-4'
const FIELD_CLASSES = 'space-y-2'
const DESCRIPTION_CLASSES = 'sr-only'
const SELECT_TRIGGER_CLASSES = 'w-full'

const styles = stylex.create({
  // `text-muted-foreground text-xs`
  hint: {
    color: colors.mutedForeground,
    // One line of plain text with no descendant of its own, so the paired line
    // height is written as the length it resolves to.
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },

  // `text-sm text-destructive`
  error: {
    color: colors.destructive,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
})

interface CreateSkillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSkillDialog({ open, onOpenChange }: CreateSkillDialogProps) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [scope, setScope] = useState<SkillScope>('general')
  const { mutate: createSkill, isPending, error } = useCreateSkill()
  const availableTags = useAvailableTags()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    createSkill(
      {
        name: name.trim(),
        description: description.trim(),
        source: 'manual',
        tags,
        scope,
      },
      {
        onSuccess: (skill) => {
          onOpenChange(false)
          resetForm()
          navigate({ to: '/skill-library/$skillId', params: { skillId: skill.id } })
        },
      }
    )
  }

  function resetForm() {
    setName('')
    setDescription('')
    setTags([])
    setScope('general')
  }

  function handleOpenChange(next: boolean) {
    if (!isPending) {
      onOpenChange(next)
      if (!next) resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New skill</DialogTitle>
          <DialogDescription className={DESCRIPTION_CLASSES}>
            Fill in a name, optional description, tags and scope to create a new skill.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className={FORM_CLASSES}>
          <div className={FIELD_CLASSES}>
            <Label htmlFor="skill-name">Name</Label>
            <Input
              id="skill-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. summarize-pr"
              required
            />
          </div>
          <div className={FIELD_CLASSES}>
            <Label htmlFor="skill-description">Description</Label>
            <Textarea
              id="skill-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this skill do?"
              rows={3}
            />
          </div>
          <div className={FIELD_CLASSES}>
            <Label htmlFor="skill-tags">Tags</Label>
            <TagsInput
              id="skill-tags"
              value={tags}
              onChange={setTags}
              suggestions={availableTags}
            />
            <p {...stylex.props(styles.hint)}>Press Space or Enter to add a tag</p>
          </div>
          <div className={FIELD_CLASSES}>
            <Label htmlFor="skill-scope">Scope</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as SkillScope)}>
              <SelectTrigger id="skill-scope" className={SELECT_TRIGGER_CLASSES}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="project-specific">Project-specific</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p {...stylex.props(styles.error)}>{error.message}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create skill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
