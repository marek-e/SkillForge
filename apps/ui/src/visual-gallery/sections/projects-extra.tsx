import { useState } from 'react'
import type { Project, SkillItem } from '@skillforge/core'
import type { SortingState } from '@tanstack/react-table'
import { ProjectOverviewCard } from '@/components/project-detail/ProjectOverviewCard'
import { ProjectSkillsSection } from '@/components/project-detail/ProjectSkillsSection'
import { RenameProjectDialog } from '@/components/project-detail/RenameProjectDialog'
import { AddProjectWebDialog } from '@/components/projects/AddProjectWebDialog'
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog'
import { ProjectsFilterBar } from '@/components/projects/ProjectsFilterBar'
import { ProjectsTable } from '@/components/projects/ProjectsTable'
import { Button } from '@/components/ui/button'
import { Case, CaseGroup, CaseRow } from '../Case'
import { sampleProject, sampleProjectCustomIcon, sampleProjectNoTools, sampleSkill } from '../data'

/**
 * Projects list and project-detail states the `app` and `app-dialogs` sections
 * do not reach (PR 24). Every case, interaction and overlay name carries the
 * `projectsx` token, so `-g projectsx` selects exactly this row's tests.
 *
 * The fixtures live here rather than in `data.ts` so no existing case changes.
 */

const noop = () => {}

/** A path long enough to hit the path cell's 300px truncation. */
const LONG_PATH =
  '/Users/fixture/projects/delta/packages/workspace/apps/experimental/very/deeply/nested/directory/name'

const favouriteProject: Project = {
  ...sampleProject,
  id: 'project-delta',
  name: 'Delta Workspace',
  path: LONG_PATH,
  isFavorite: true,
}

const plainProject: Project = {
  ...sampleProject,
  id: 'project-epsilon',
  name: 'Epsilon',
  path: '/Users/fixture/projects/epsilon',
  isFavorite: false,
  detectedTools: [
    { name: 'claude-code', detected: true },
    { name: 'cursor', detected: false },
  ],
}

/** Every detected tool, so the Tools cell wraps onto a second badge row. */
const manyToolsProject: Project = {
  ...sampleProject,
  id: 'project-zeta',
  name: 'Zeta Platform Services',
  path: '/Users/fixture/projects/zeta',
  isFavorite: false,
  detectedTools: [
    { name: 'claude-code', detected: true },
    { name: 'cursor', detected: true },
    { name: 'codex', detected: true },
    { name: 'gemini-cli', detected: true },
    { name: 'windsurf', detected: true },
  ],
}

const longValueProject: Project = {
  ...sampleProject,
  id: 'project-eta',
  name: 'Eta',
  path: LONG_PATH,
  preferredEditor: 'custom',
  customEditorCmd: 'my-very-long-editor-command --wait --new-window',
  detectedTools: [
    { name: 'claude-code', detected: true },
    { name: 'cursor', detected: true },
    { name: 'codex', detected: true },
    { name: 'gemini-cli', detected: true },
    { name: 'windsurf', detected: true },
  ],
}

const PROJECT_ROWS = [favouriteProject, plainProject, manyToolsProject]

const manySkillsByTool: Record<string, SkillItem[]> = {
  'claude-code': [
    {
      name: 'summarize-pull-request',
      description: 'Reads a pull request diff and produces a reviewer-facing summary.',
      filePath: '/Users/fixture/.claude/skills/summarize-pull-request/SKILL.md',
      body: '# Summarize pull request\n',
    },
    {
      name: 'multi-file-skill',
      description: 'A skill whose implementation spans a directory, so it has no inline body.',
      filePath: '/Users/fixture/.claude/skills/multi-file-skill/SKILL.md',
    },
  ],
  cursor: [
    {
      name: 'write-migration',
      description: 'Generates a reversible SQL migration from a schema diff.',
      filePath: '/Users/fixture/.cursor/skills/write-migration/SKILL.md',
      body: '# Write migration\n',
    },
    {
      name: 'review-diff',
      description: 'Built-in review skill with no body of its own.',
      filePath: '/Users/fixture/.cursor/skills/review-diff/SKILL.md',
    },
  ],
}

const TWO_TOOLS = [
  { name: 'claude-code', detected: true },
  { name: 'cursor', detected: true },
]

/** A filter bar that owns its state, so the interaction block can drive it. */
function StatefulFilterBar() {
  const [query, setQuery] = useState('')
  const [tools, setTools] = useState<string[]>([])

  return (
    <ProjectsFilterBar
      searchQuery={query}
      onSearchChange={setQuery}
      availableTools={['claude-code', 'cursor', 'codex']}
      selectedTools={tools}
      onToolToggle={(tool) =>
        setTools((current) =>
          current.includes(tool) ? current.filter((t) => t !== tool) : [...current, tool]
        )
      }
    />
  )
}

/** A table that owns its sorting, so a header click can be captured. */
function StatefulTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [favorites, setFavorites] = useState<string[]>(['project-delta'])

  return (
    <ProjectsTable
      projects={PROJECT_ROWS.map((project) => ({
        ...project,
        isFavorite: favorites.includes(project.id),
      }))}
      sorting={sorting}
      onSortingChange={setSorting}
      onRowClick={noop}
      onFavoriteToggle={(projectId) =>
        setFavorites((current) =>
          current.includes(projectId)
            ? current.filter((id) => id !== projectId)
            : [...current, projectId]
        )
      }
      onDeleteClick={noop}
    />
  )
}

type DialogId =
  | 'projectsx-add-project-long-error'
  | 'projectsx-rename-project-empty'
  | 'projectsx-delete-project-long-name'
  | 'projectsx-delete-project-pending'
  | null

export function ProjectsExtraSection() {
  const [iconPath, setIconPath] = useState('')
  const [open, setOpen] = useState<DialogId>(null)
  const [renameDraft, setRenameDraft] = useState('')

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
    <div className="space-y-8">
      <CaseGroup title="projects table">
        <Case name="projectsx-table-sorted-name-desc" width={900}>
          <ProjectsTable
            projects={PROJECT_ROWS}
            sorting={[{ id: 'name', desc: true }]}
            onSortingChange={noop}
            onRowClick={noop}
            onFavoriteToggle={noop}
            onDeleteClick={noop}
          />
        </Case>
        <Case name="projectsx-table-sorted-path-asc" width={900}>
          <ProjectsTable
            projects={PROJECT_ROWS}
            sorting={[{ id: 'path', desc: false }]}
            onSortingChange={noop}
            onRowClick={noop}
            onFavoriteToggle={noop}
            onDeleteClick={noop}
          />
        </Case>
        <Case name="projectsx-table-all-favorites" width={900}>
          <ProjectsTable
            projects={PROJECT_ROWS.map((project) => ({ ...project, isFavorite: true }))}
            sorting={[]}
            onSortingChange={noop}
            onRowClick={noop}
            onFavoriteToggle={noop}
            onDeleteClick={noop}
          />
        </Case>
        <Case name="projectsx-table-narrow-truncation" width={520}>
          <ProjectsTable
            projects={[favouriteProject, sampleProjectNoTools]}
            sorting={[]}
            onSortingChange={noop}
            onRowClick={noop}
            onFavoriteToggle={noop}
            onDeleteClick={noop}
          />
        </Case>
        <Case name="projectsx-table-empty" width={900}>
          <ProjectsTable
            projects={[]}
            sorting={[]}
            onSortingChange={noop}
            onRowClick={noop}
            onFavoriteToggle={noop}
            onDeleteClick={noop}
          />
        </Case>
        <Case name="projectsx-table-stateful" width={900}>
          <StatefulTable />
        </Case>
      </CaseGroup>

      <CaseGroup title="projects filter bar">
        <Case name="projectsx-filter-bar-all-selected" width={900}>
          <ProjectsFilterBar
            searchQuery="alpha platform"
            onSearchChange={noop}
            availableTools={['claude-code', 'cursor', 'codex']}
            selectedTools={['claude-code', 'cursor', 'codex']}
            onToolToggle={noop}
          />
        </Case>
        <Case name="projectsx-filter-bar-no-tools" width={900}>
          <ProjectsFilterBar
            searchQuery=""
            onSearchChange={noop}
            availableTools={[]}
            selectedTools={[]}
            onToolToggle={noop}
          />
        </Case>
        <Case name="projectsx-filter-bar-stateful" width={900}>
          <StatefulFilterBar />
        </Case>
      </CaseGroup>

      <CaseGroup title="project overview card">
        <Case name="projectsx-overview-card-long-values" width={720}>
          <ProjectOverviewCard
            project={longValueProject}
            iconPath=""
            onIconPathChange={noop}
            onApplyIcon={noop}
            isIconPending={false}
            onEditorChange={noop}
          />
        </Case>
        <Case name="projectsx-overview-card-icon" width={720}>
          <ProjectOverviewCard
            project={sampleProjectCustomIcon}
            iconPath={sampleProjectCustomIcon.iconPath ?? ''}
            onIconPathChange={noop}
            onApplyIcon={noop}
            isIconPending={false}
            onEditorChange={noop}
          />
        </Case>
        <Case name="projectsx-overview-card-narrow" width={420}>
          <ProjectOverviewCard
            project={longValueProject}
            iconPath={iconPath}
            onIconPathChange={setIconPath}
            onApplyIcon={noop}
            isIconPending={false}
            onEditorChange={noop}
          />
        </Case>
      </CaseGroup>

      <CaseGroup title="project skills section">
        <Case name="projectsx-skills-section-many" width={900}>
          <ProjectSkillsSection
            detectedTools={TWO_TOOLS}
            skillsByTool={manySkillsByTool}
            librarySkills={[]}
            preferredEditor={null}
            customEditorCmd={null}
            onSave={noop}
            isSaving={false}
          />
        </Case>
        <Case name="projectsx-skills-section-all-saved" width={900}>
          <ProjectSkillsSection
            detectedTools={[{ name: 'claude-code', detected: true }]}
            skillsByTool={{ 'claude-code': manySkillsByTool['claude-code'] ?? [] }}
            librarySkills={[
              sampleSkill,
              {
                ...sampleSkill,
                id: 'skill-multi',
                name: 'multi-file-skill',
                implementationRef: '/Users/fixture/.claude/skills/multi-file-skill/SKILL.md',
              },
            ]}
            onSave={noop}
            isSaving={false}
          />
        </Case>
        <Case name="projectsx-skills-section-saving" width={900}>
          <ProjectSkillsSection
            detectedTools={TWO_TOOLS}
            skillsByTool={manySkillsByTool}
            librarySkills={[]}
            onSave={noop}
            isSaving
          />
        </Case>
        <Case name="projectsx-skills-section-view-target" width={900}>
          <ProjectSkillsSection
            detectedTools={TWO_TOOLS}
            skillsByTool={manySkillsByTool}
            librarySkills={[]}
            onSave={noop}
            isSaving={false}
          />
        </Case>
      </CaseGroup>

      <CaseGroup title="project dialogs">
        <CaseRow>
          {trigger('projectsx-add-project-long-error', 'Add project (long error)')}
          {trigger('projectsx-rename-project-empty', 'Rename project (empty)')}
          {trigger('projectsx-delete-project-long-name', 'Delete project (long name)')}
          {trigger('projectsx-delete-project-pending', 'Delete project (pending)')}
        </CaseRow>
      </CaseGroup>

      <AddProjectWebDialog
        open={open === 'projectsx-add-project-long-error'}
        onOpenChange={() => setOpen(null)}
        onSubmit={noop}
        isPending
        error="That directory does not exist, is not readable, or is not a directory. Check the path and try again."
      />

      <RenameProjectDialog
        open={open === 'projectsx-rename-project-empty'}
        onOpenChange={() => setOpen(null)}
        name={renameDraft}
        onNameChange={setRenameDraft}
        onSubmit={noop}
        isPending={false}
      />

      <DeleteProjectDialog
        project={open === 'projectsx-delete-project-long-name' ? sampleProjectNoTools : null}
        onOpenChange={() => setOpen(null)}
        onConfirm={noop}
        isPending={false}
      />

      <DeleteProjectDialog
        project={open === 'projectsx-delete-project-pending' ? plainProject : null}
        onOpenChange={() => setOpen(null)}
        onConfirm={noop}
        isPending
      />
    </div>
  )
}
