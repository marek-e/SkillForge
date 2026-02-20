import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
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
import { Textarea } from '@/components/ui/textarea'
import { useCreateSkill } from '@/hooks/use-skill-library'

interface CreateSkillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSkillDialog({ open, onOpenChange }: CreateSkillDialogProps) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const { mutate: createSkill, isPending, error } = useCreateSkill()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    createSkill(
      {
        name: name.trim(),
        description: description.trim(),
        source: 'manual',
        tags: [],
        scope: 'general',
      },
      {
        onSuccess: (skill) => {
          onOpenChange(false)
          setName('')
          setDescription('')
          navigate({ to: '/skill-library/$skillId', params: { skillId: skill.id } })
        },
      }
    )
  }

  function handleOpenChange(next: boolean) {
    if (!isPending) {
      onOpenChange(next)
      if (!next) {
        setName('')
        setDescription('')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New skill</DialogTitle>
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
