import * as stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RenameProjectDialog } from '@/components/project-detail/RenameProjectDialog'
import { AddProjectWebDialog } from '@/components/projects/AddProjectWebDialog'
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog'
import { CreateSkillDialog } from '@/components/skills/CreateSkillDialog'
import { DeleteSkillDialog } from '@/components/skills/DeleteSkillDialog'
import { Case, CaseGroup, CaseRow } from '../Case'
import { sampleProject, sampleSkill } from '../data'

type DialogId =
  | 'create-skill'
  | 'delete-skill'
  | 'delete-skill-pending'
  | 'add-project'
  | 'add-project-error'
  | 'delete-project'
  | 'rename-project'
  | 'rename-project-pending'
  | null

const noop = () => {}

/**
 * Application dialogs. Each case is a trigger button; `overlays.spec.ts` clicks
 * it and captures the full page so the portal, backdrop and content are all in
 * the frozen original.
 */
export function AppDialogsSection() {
  const [open, setOpen] = useState<DialogId>(null)
  const [renameDraft, setRenameDraft] = useState('Alpha Platform')

  function trigger(id: Exclude<DialogId, null>, label: string) {
    return (
      <Case name={`open-${id}`}>
        <Button variant="outline" onClick={() => setOpen(id)}>
          {label}
        </Button>
      </Case>
    )
  }

  return (
    <div {...stylex.props(galleryStyles.case0)}>
      <CaseGroup title="skill dialogs">
        <CaseRow>
          {trigger('create-skill', 'Create skill')}
          {trigger('delete-skill', 'Delete skill')}
          {trigger('delete-skill-pending', 'Delete skill (pending)')}
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="project dialogs">
        <CaseRow>
          {trigger('add-project', 'Add project')}
          {trigger('add-project-error', 'Add project (error)')}
          {trigger('delete-project', 'Delete project')}
          {trigger('rename-project', 'Rename project')}
          {trigger('rename-project-pending', 'Rename project (pending)')}
        </CaseRow>
      </CaseGroup>

      <CreateSkillDialog
        open={open === 'create-skill'}
        onOpenChange={(next) => setOpen(next ? 'create-skill' : null)}
      />

      <DeleteSkillDialog
        skill={open === 'delete-skill' ? sampleSkill : null}
        onOpenChange={() => setOpen(null)}
        onConfirm={noop}
        isPending={false}
      />

      <DeleteSkillDialog
        skill={open === 'delete-skill-pending' ? sampleSkill : null}
        onOpenChange={() => setOpen(null)}
        onConfirm={noop}
        isPending
      />

      <AddProjectWebDialog
        open={open === 'add-project'}
        onOpenChange={() => setOpen(null)}
        onSubmit={noop}
        isPending={false}
      />

      <AddProjectWebDialog
        open={open === 'add-project-error'}
        onOpenChange={() => setOpen(null)}
        onSubmit={noop}
        isPending={false}
        error="That directory does not exist."
      />

      <DeleteProjectDialog
        project={open === 'delete-project' ? sampleProject : null}
        onOpenChange={() => setOpen(null)}
        onConfirm={noop}
        isPending={false}
      />

      <RenameProjectDialog
        open={open === 'rename-project'}
        onOpenChange={() => setOpen(null)}
        name={renameDraft}
        onNameChange={setRenameDraft}
        onSubmit={noop}
        isPending={false}
      />

      <RenameProjectDialog
        open={open === 'rename-project-pending'}
        onOpenChange={() => setOpen(null)}
        name={renameDraft}
        onNameChange={setRenameDraft}
        onSubmit={noop}
        isPending
      />
    </div>
  )
}

const galleryStyles = stylex.create({
  case0: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '2rem' },
  },
})
