import { fonts, typography } from '@/styles/tokens.stylex'
import * as stylex from '@stylexjs/stylex'
import { useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { EditorSelect } from '@/components/EditorSelect'
import { ElectronTitlebar } from '@/components/electron-titlebar'
import { ErrorContainer } from '@/components/ErrorContainer'
import { ModeToggle } from '@/components/mode-toggle'
import { ProjectAvatar } from '@/components/project-avatar'
import { ToolCard } from '@/components/ToolCard'
import { ToolCardCompact } from '@/components/ToolCardCompact'
import { ProjectOverviewCard } from '@/components/project-detail/ProjectOverviewCard'
import { ProjectSkillsSection } from '@/components/project-detail/ProjectSkillsSection'
import { ProjectsFilterBar } from '@/components/projects/ProjectsFilterBar'
import { ProjectsTable } from '@/components/projects/ProjectsTable'
import { SkillLibraryFilterBar } from '@/components/skill-library/SkillLibraryFilterBar'
import { SkillCard } from '@/components/skills/SkillCard'
import { SkillDetailResourceFiles } from '@/components/skills/SkillDetailResourceFiles'
import { TagsInput } from '@/components/skills/TagsInput'
import { Case, CaseGroup, CaseRow } from '../Case'
import {
  LONG_TEXT,
  sampleCommands,
  sampleProject,
  sampleProjectCustomIcon,
  sampleProjectNoTools,
  sampleProjectSkillsByTool,
  sampleSkill,
  sampleToolDetected,
  sampleToolSkills,
  sampleToolUndetected,
} from '../data'

const noop = () => {}

export function AppSection() {
  const [tags, setTags] = useState<string[]>(['review', 'git'])
  const [iconPath, setIconPath] = useState('')
  const loadedFileContentsRef = useRef<Record<string, string>>({})

  return (
    <div {...stylex.props(galleryStyles.case0)}>
      <CaseGroup title="tool cards">
        <CaseRow>
          <Case name="tool-card-compact-detected" width={320}>
            <ToolCardCompact tool={sampleToolDetected} />
          </Case>
          <Case name="tool-card-compact-undetected" width={320}>
            <ToolCardCompact tool={sampleToolUndetected} />
          </Case>
          <Case name="quirk-tool-card-compact-unknown-empty-logo" width={320}>
            <ToolCardCompact
              tool={{
                name: 'unknown-tool',
                detected: true,
                paths: {},
                commandCount: 0,
                skillCount: 1,
              }}
            />
          </Case>
        </CaseRow>
        <Case name="tool-card-detected" width={640}>
          <ToolCard
            tool={sampleToolDetected}
            displayName="Claude Code"
            commands={sampleCommands}
            skills={sampleToolSkills}
          />
        </Case>
        <Case name="tool-card-no-commands" width={640}>
          <ToolCard
            tool={sampleToolDetected}
            displayName="Cursor"
            skills={sampleToolSkills}
            showCommands={false}
          />
        </Case>
        <Case name="tool-card-undetected" width={640}>
          <ToolCard tool={sampleToolUndetected} displayName="Gemini CLI" />
        </Case>
        <Case name="tool-card-empty-lists" width={640}>
          <ToolCard tool={sampleToolDetected} displayName="Claude Code" commands={[]} skills={[]} />
        </Case>
      </CaseGroup>

      <CaseGroup title="skill card">
        <CaseRow>
          <Case name="skill-card-grid" width={320}>
            <SkillCard
              viewMode="grid"
              name="summarize-pull-request"
              description={LONG_TEXT}
              badges={
                <>
                  <Badge variant="secondary" sx={galleryStyles.case1}>
                    imported
                  </Badge>
                  <Badge variant="secondary" sx={galleryStyles.case2}>
                    #review
                  </Badge>
                </>
              }
              onClick={noop}
            />
          </Case>
          <Case name="skill-card-grid-plain" width={320}>
            <SkillCard viewMode="grid" name="explain-stack-trace" description="" />
          </Case>
          <Case name="skill-card-list" width={480}>
            <SkillCard
              viewMode="list"
              name="summarize-pull-request"
              description={LONG_TEXT}
              badges={
                <Badge variant="secondary" sx={galleryStyles.case3}>
                  imported
                </Badge>
              }
              onClick={noop}
            />
          </Case>
          <Case name="skill-card-list-plain" width={480}>
            <SkillCard viewMode="list" name="explain-stack-trace" description="" />
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="project avatar">
        <CaseRow>
          <Case name="project-avatar-xs">
            <ProjectAvatar project={sampleProject} size="xs" />
          </Case>
          <Case name="project-avatar-sm">
            <ProjectAvatar project={sampleProject} size="sm" />
          </Case>
          <Case name="project-avatar-default">
            <ProjectAvatar project={sampleProject} />
          </Case>
          <Case name="project-avatar-lg">
            <ProjectAvatar project={sampleProject} size="lg" />
          </Case>
          <Case name="project-avatar-custom-icon">
            <ProjectAvatar project={sampleProjectCustomIcon} size="lg" />
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="editor select">
        <CaseRow>
          <Case name="editor-select-auto" width={280}>
            <EditorSelect
              value="auto"
              customCmd=""
              onChange={noop}
              triggerSx={galleryStyles.editorTrigger}
            />
          </Case>
          <Case name="editor-select-cursor" width={280}>
            <EditorSelect
              value="cursor"
              customCmd=""
              onChange={noop}
              triggerSx={galleryStyles.editorTrigger}
            />
          </Case>
          <Case name="editor-select-custom" width={420}>
            <EditorSelect
              value="custom"
              customCmd="windsurf"
              onChange={noop}
              triggerSx={galleryStyles.editorTrigger}
              inputSx={galleryStyles.editorInput}
            />
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="filter bars">
        <Case name="skill-library-filter-bar" width={900}>
          <SkillLibraryFilterBar
            searchQuery=""
            onSearchChange={noop}
            availableTools={['claude', 'cursor']}
            selectedTools={[]}
            onToolToggle={noop}
            availableTags={['automation', 'git', 'review']}
            selectedTags={[]}
            onTagToggle={noop}
            viewMode="list"
            onViewModeChange={noop}
          />
        </Case>
        <Case name="skill-library-filter-bar-active" width={900}>
          <SkillLibraryFilterBar
            searchQuery="migration"
            onSearchChange={noop}
            availableTools={['claude', 'cursor']}
            selectedTools={['cursor']}
            onToolToggle={noop}
            availableTags={['automation', 'git', 'review']}
            selectedTags={['git']}
            onTagToggle={noop}
            viewMode="grid"
            onViewModeChange={noop}
          />
        </Case>
        <Case name="projects-filter-bar" width={900}>
          <ProjectsFilterBar
            searchQuery=""
            onSearchChange={noop}
            availableTools={['claude-code', 'cursor', 'codex']}
            selectedTools={[]}
            onToolToggle={noop}
          />
        </Case>
        <Case name="projects-filter-bar-active" width={900}>
          <ProjectsFilterBar
            searchQuery="alpha"
            onSearchChange={noop}
            availableTools={['claude-code', 'cursor', 'codex']}
            selectedTools={['claude-code']}
            onToolToggle={noop}
          />
        </Case>
      </CaseGroup>

      <CaseGroup title="projects table">
        <Case name="projects-table" width={900}>
          <ProjectsTable
            projects={[sampleProject, sampleProjectCustomIcon, sampleProjectNoTools]}
            sorting={[{ id: 'name', desc: false }]}
            onSortingChange={noop}
            onRowClick={noop}
            onFavoriteToggle={noop}
            onDeleteClick={noop}
          />
        </Case>
      </CaseGroup>

      <CaseGroup title="project detail">
        <Case name="project-overview-card" width={720}>
          <ProjectOverviewCard
            project={sampleProject}
            iconPath={iconPath}
            onIconPathChange={setIconPath}
            onApplyIcon={noop}
            isIconPending={false}
            onEditorChange={noop}
          />
        </Case>
        <Case name="project-overview-card-pending" width={720}>
          <ProjectOverviewCard
            project={sampleProjectNoTools}
            iconPath=""
            onIconPathChange={noop}
            onApplyIcon={noop}
            isIconPending
            onEditorChange={noop}
          />
        </Case>
        <Case name="project-skills-section" width={900}>
          <ProjectSkillsSection
            detectedTools={sampleProject.detectedTools}
            skillsByTool={sampleProjectSkillsByTool}
            librarySkills={[sampleSkill]}
            preferredEditor="cursor"
            customEditorCmd={null}
            onSave={noop}
            isSaving={false}
          />
        </Case>
        <Case name="project-skills-section-empty" width={900}>
          <ProjectSkillsSection
            detectedTools={[{ name: 'claude-code', detected: true }]}
            skillsByTool={{}}
            librarySkills={[]}
            onSave={noop}
            isSaving={false}
          />
        </Case>
      </CaseGroup>

      <CaseGroup title="skill detail parts">
        <Case name="tags-input-filled" width={360}>
          <TagsInput
            value={tags}
            onChange={setTags}
            suggestions={['automation', 'git', 'review']}
          />
        </Case>
        <Case name="tags-input-empty" width={360}>
          <TagsInput value={[]} onChange={noop} suggestions={['automation', 'git', 'review']} />
        </Case>
        <Case name="skill-detail-resource-files" width={480}>
          <SkillDetailResourceFiles
            skillId="skill-alpha"
            files={['reference.md', 'checklist.md', 'script.sh']}
            fileDrafts={{}}
            loadedFileContentsRef={loadedFileContentsRef}
            onFileDraftChange={noop}
          />
        </Case>
      </CaseGroup>

      <CaseGroup title="shell">
        <CaseRow>
          <Case name="mode-toggle">
            <ModeToggle />
          </Case>
        </CaseRow>
        <Case name="error-container-retry" width={640}>
          <ErrorContainer
            title="Failed to load projects"
            message="Fixture runtime is unavailable."
            onRetry={noop}
          />
        </Case>
        <Case name="error-container-back" width={640}>
          <ErrorContainer
            title="Tool not found"
            message={'No tool named "nope" was found.'}
            backTo="/"
            backLabel="Back to tools"
          />
        </Case>
        <Case name="error-container-plain" width={640}>
          <ErrorContainer message="Something went wrong without any action." />
        </Case>
        <Case name="quirk-electron-titlebar-web" width={640}>
          <ElectronTitlebar />
        </Case>
      </CaseGroup>
    </div>
  )
}

const galleryStyles = stylex.create({
  editorTrigger: { width: '160px' },
  editorInput: { width: '140px', height: '1.75rem' },
  case0: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '2rem' },
  },
  case1: { fontSize: '0.75rem', lineHeight: typography.xsLineHeight },
  case2: { fontFamily: fonts.mono, fontSize: '0.75rem', lineHeight: typography.xsLineHeight },
  case3: { fontSize: '0.75rem', lineHeight: typography.xsLineHeight },
})
