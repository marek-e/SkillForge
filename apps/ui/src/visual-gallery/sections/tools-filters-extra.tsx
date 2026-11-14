import * as stylex from '@stylexjs/stylex'
import { useState } from 'react'
import type { ToolStatus } from '@skillforge/core'
import type { SkillViewMode } from '@/lib/skill-view'
import { SkillLibraryFilterBar } from '@/components/skill-library/SkillLibraryFilterBar'
import { ToolCard } from '@/components/ToolCard'
import { ToolCardCompact } from '@/components/ToolCardCompact'
import { Case, CaseGroup, CaseRow } from '../Case'
import { sampleCommands, sampleToolDetected, sampleToolSkills } from '../data'

/**
 * Tool card and skill-library filter states the `app` section does not reach
 * (PR 22). Every case and interaction name carries the `toolsx` token, so
 * `-g 'toolsx|tools-filters-extra'` selects this section, its cases and its
 * interaction block and nothing else.
 *
 * The `app` section already pins the two compact cards, the four `ToolCard`
 * shapes and the two filter bars; what is missing there is every state that
 * depends on data or interaction — an inverted tool logo in dark mode, the
 * singular count branch, the overflow menu a tool with a download URL gets, an
 * expanded accordion body, each filter button selected, and both positions of
 * the display-view switch.
 */
const cursorDetected: ToolStatus = {
  name: 'cursor',
  detected: true,
  paths: { globalDir: '/Users/fixture/.cursor' },
  commandCount: 0,
  skillCount: 2,
}

/** `codex` is undetected **and** has a download URL, so the card shows the menu. */
const codexUndetected: ToolStatus = {
  name: 'codex',
  detected: false,
  paths: {},
  commandCount: 0,
  skillCount: 0,
}

/** The `1 skill · 1 command` branch: both counts are singular. */
const singularCounts: ToolStatus = {
  name: 'claude-code',
  detected: true,
  paths: { globalDir: '/Users/fixture/.claude' },
  commandCount: 1,
  skillCount: 1,
}

const TOOLS = ['claude', 'cursor']
const TAGS = ['automation', 'git', 'review']
const MANY_TOOLS = ['claude', 'cursor', 'codex', 'gemini-cli']

const noop = () => {}

/**
 * A filter bar wired to real state, so the interaction block can click the
 * display-view switch and the filter buttons and capture what a user sees.
 */
function StatefulFilterBar() {
  const [query, setQuery] = useState('')
  const [tools, setTools] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<SkillViewMode>('list')

  function toggle(list: string[], value: string) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
  }

  return (
    <SkillLibraryFilterBar
      searchQuery={query}
      onSearchChange={setQuery}
      availableTools={TOOLS}
      selectedTools={tools}
      onToolToggle={(tool) => setTools((current) => toggle(current, tool))}
      availableTags={TAGS}
      selectedTags={tags}
      onTagToggle={(tag) => setTags((current) => toggle(current, tag))}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  )
}

export function ToolsFiltersExtraSection() {
  return (
    <div {...stylex.props(galleryStyles.case0)}>
      <CaseGroup title="compact tool cards">
        <CaseRow>
          <Case name="toolsx-compact-invert-logo" width={320}>
            <ToolCardCompact tool={cursorDetected} />
          </Case>
          <Case name="toolsx-compact-hover-target" width={320}>
            <ToolCardCompact tool={sampleToolDetected} />
          </Case>
          <Case name="toolsx-compact-menu-target" width={320}>
            <ToolCardCompact tool={codexUndetected} />
          </Case>
          <Case name="toolsx-compact-singular-counts" width={320}>
            <ToolCardCompact tool={singularCounts} />
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="tool card panels">
        <Case name="toolsx-tool-card-default-icon" width={640}>
          <ToolCard tool={sampleToolDetected} commands={sampleCommands} skills={sampleToolSkills} />
        </Case>
        <Case name="toolsx-tool-card-accordion-target" width={640}>
          <ToolCard
            tool={sampleToolDetected}
            displayName="Claude Code"
            commands={sampleCommands}
            skills={sampleToolSkills}
          />
        </Case>
        <Case name="toolsx-tool-card-skills-empty" width={640}>
          <ToolCard
            tool={sampleToolDetected}
            displayName="Cursor"
            skills={[]}
            showCommands={false}
          />
        </Case>
      </CaseGroup>

      <CaseGroup title="skill library filters">
        <Case name="toolsx-filter-bar-tools-selected" width={900}>
          <SkillLibraryFilterBar
            searchQuery=""
            onSearchChange={noop}
            availableTools={TOOLS}
            selectedTools={TOOLS}
            onToolToggle={noop}
            availableTags={TAGS}
            selectedTags={[]}
            onTagToggle={noop}
            viewMode="list"
            onViewModeChange={noop}
          />
        </Case>
        <Case name="toolsx-filter-bar-tags-selected" width={900}>
          <SkillLibraryFilterBar
            searchQuery=""
            onSearchChange={noop}
            availableTools={TOOLS}
            selectedTools={[]}
            onToolToggle={noop}
            availableTags={TAGS}
            selectedTags={TAGS}
            onTagToggle={noop}
            viewMode="list"
            onViewModeChange={noop}
          />
        </Case>
        <Case name="toolsx-filter-bar-query-clear" width={900}>
          <SkillLibraryFilterBar
            searchQuery="migration"
            onSearchChange={noop}
            availableTools={[]}
            selectedTools={[]}
            onToolToggle={noop}
            availableTags={[]}
            selectedTags={[]}
            onTagToggle={noop}
            viewMode="list"
            onViewModeChange={noop}
          />
        </Case>
        <Case name="toolsx-filter-bar-view-list" width={900}>
          <SkillLibraryFilterBar
            searchQuery=""
            onSearchChange={noop}
            availableTools={[]}
            selectedTools={[]}
            onToolToggle={noop}
            availableTags={[]}
            selectedTags={[]}
            onTagToggle={noop}
            viewMode="list"
            onViewModeChange={noop}
          />
        </Case>
        <Case name="toolsx-filter-bar-view-grid" width={900}>
          <SkillLibraryFilterBar
            searchQuery=""
            onSearchChange={noop}
            availableTools={[]}
            selectedTools={[]}
            onToolToggle={noop}
            availableTags={[]}
            selectedTags={[]}
            onTagToggle={noop}
            viewMode="grid"
            onViewModeChange={noop}
          />
        </Case>
        <Case name="toolsx-filter-bar-wrapped" width={420}>
          <SkillLibraryFilterBar
            searchQuery=""
            onSearchChange={noop}
            availableTools={MANY_TOOLS}
            selectedTools={['cursor']}
            onToolToggle={noop}
            availableTags={TAGS}
            selectedTags={['review']}
            onTagToggle={noop}
            viewMode="grid"
            onViewModeChange={noop}
          />
        </Case>
        <Case name="toolsx-filter-bar-focus-target" width={900}>
          <SkillLibraryFilterBar
            searchQuery=""
            onSearchChange={noop}
            availableTools={TOOLS}
            selectedTools={[]}
            onToolToggle={noop}
            availableTags={TAGS}
            selectedTags={[]}
            onTagToggle={noop}
            viewMode="list"
            onViewModeChange={noop}
          />
        </Case>
        <Case name="toolsx-filter-bar-stateful" width={900}>
          <StatefulFilterBar />
        </Case>
      </CaseGroup>
    </div>
  )
}

const galleryStyles = stylex.create({
  case0: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '2rem' },
  },
})
