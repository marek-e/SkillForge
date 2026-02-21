import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { SkillScope } from '@skillforge/core'
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
          <DialogDescription className="sr-only">
            Fill in a name, optional description, tags and scope to create a new skill.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skill-name">Name</Label>
            <Input
              id="skill-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. summarize-pr"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skill-description">Description</Label>
            <Textarea
              id="skill-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this skill do?"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skill-tags">Tags</Label>
            <TagsInput
              id="skill-tags"
              value={tags}
              onChange={setTags}
              suggestions={availableTags}
            />
            <p className="text-muted-foreground text-xs">Press Space or Enter to add a tag</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="skill-scope">Scope</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as SkillScope)}>
              <SelectTrigger id="skill-scope" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="project-specific">Project-specific</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error.message}</p>}
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
