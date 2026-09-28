import { useRef, useState } from 'react'
import { MoreHorizontalIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SkillCard } from '@/components/skills/SkillCard'
import { SkillDetailResourceFiles } from '@/components/skills/SkillDetailResourceFiles'
import { TagsInput } from '@/components/skills/TagsInput'
import { Case, CaseGroup, CaseRow } from '../Case'
import { LONG_TEXT } from '../data'

/**
 * The `skills/*` states the `app` and `app-dialogs` sections do not reach
 * (PR 23). Every case name carries the `skillsx` token, so
 * `-g 'skillsx|skills-extra'` selects this section, its interaction block and
 * nothing else.
 *
 * `app` already covers a plain grid and list card and two tags inputs; what is
 * missing is the card's action slot and its truncating title, a tag row that
 * wraps, a tag long enough to overflow its own box, a resource list whose names
 * are long, and every pointer/keyboard state of the three components. The
 * interaction targets are separate cases so a hover or a removed tag never
 * moves a static one.
 */
const LONG_NAME = 'summarize-pull-request-and-post-a-reviewer-facing-digest'

const MANY_TAGS = ['review', 'git', 'automation', 'release', 'changelog', 'triage']

const LONG_TAG = 'a-very-long-tag-name-that-does-not-wrap'

const SUGGESTIONS = ['automation', 'git', 'review', 'refactor']

const LONG_FILES = [
  'a-resource-file-with-a-long-name.md',
  'checklist.md',
  'scripts/generate-release-notes.sh',
]

function CardBadges() {
  return (
    <>
      <Badge variant="outline" className="text-xs gap-1 px-1.5 py-0">
        Claude Code
      </Badge>
      <Badge variant="secondary" className="text-xs">
        imported
      </Badge>
      <Badge variant="outline" className="text-xs">
        project-specific
      </Badge>
      <Badge variant="secondary" className="text-xs font-mono">
        #review
      </Badge>
      <Badge variant="secondary" className="text-xs font-mono">
        #automation
      </Badge>
    </>
  )
}

function CardActions() {
  return (
    <Button variant="ghost" size="icon-sm" aria-label="Skill actions">
      <MoreHorizontalIcon />
    </Button>
  )
}

const noop = () => {}

export function SkillsExtraSection() {
  const [manyTags, setManyTags] = useState<string[]>(MANY_TAGS)
  const [removeTags, setRemoveTags] = useState<string[]>(['review', 'git', 'automation'])
  const [keyboardTags, setKeyboardTags] = useState<string[]>(['review'])
  const loadedFileContentsRef = useRef<Record<string, string>>({})

  return (
    <div className="space-y-8">
      <CaseGroup title="skill card grid mode">
        <CaseRow>
          <Case name="skillsx-card-grid-actions" width={320}>
            <SkillCard
              viewMode="grid"
              name="summarize-pull-request"
              description={LONG_TEXT}
              badges={<CardBadges />}
              actions={<CardActions />}
              onClick={noop}
            />
          </Case>
          <Case name="skillsx-card-grid-truncated" width={240}>
            <SkillCard
              viewMode="grid"
              name={LONG_NAME}
              description={LONG_TEXT}
              badges={<CardBadges />}
            />
          </Case>
          <Case name="skillsx-card-grid-hover-target" width={320}>
            <SkillCard
              viewMode="grid"
              name="explain-stack-trace"
              description="Turns a stack trace into a short explanation."
              onClick={noop}
            />
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="skill card list mode">
        <Case name="skillsx-card-list-actions" width={480}>
          <SkillCard
            viewMode="list"
            name="summarize-pull-request"
            description={LONG_TEXT}
            badges={<CardBadges />}
            actions={<CardActions />}
            onClick={noop}
          />
        </Case>
        <Case name="skillsx-card-list-narrow" width={260}>
          <SkillCard
            viewMode="list"
            name={LONG_NAME}
            description={LONG_TEXT}
            badges={<CardBadges />}
          />
        </Case>
        <Case name="skillsx-card-list-hover-target" width={480}>
          <SkillCard
            viewMode="list"
            name="explain-stack-trace"
            description="Turns a stack trace into a short explanation."
            onClick={noop}
          />
        </Case>
      </CaseGroup>

      <CaseGroup title="tags input">
        <CaseRow>
          <Case name="skillsx-tags-many" width={360}>
            <TagsInput value={manyTags} onChange={setManyTags} suggestions={SUGGESTIONS} />
          </Case>
          <Case name="skillsx-tags-long" width={240}>
            <TagsInput value={[LONG_TAG]} onChange={noop} suggestions={SUGGESTIONS} />
          </Case>
          <Case name="skillsx-tags-no-suggestions" width={360}>
            <TagsInput value={['review']} onChange={noop} />
          </Case>
        </CaseRow>
        <CaseRow>
          <Case name="skillsx-tags-focus-target" width={360}>
            <TagsInput value={['review', 'git']} onChange={noop} suggestions={SUGGESTIONS} />
          </Case>
          <Case name="skillsx-tags-remove-target" width={360}>
            <TagsInput value={removeTags} onChange={setRemoveTags} suggestions={SUGGESTIONS} />
          </Case>
          <Case name="skillsx-tags-keyboard-target" width={360}>
            <TagsInput value={keyboardTags} onChange={setKeyboardTags} suggestions={SUGGESTIONS} />
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="resource files">
        <Case name="skillsx-files-long-names" width={360}>
          <SkillDetailResourceFiles
            skillId="skill-delta"
            files={LONG_FILES}
            fileDrafts={{}}
            loadedFileContentsRef={loadedFileContentsRef}
            onFileDraftChange={noop}
          />
        </Case>
        <Case name="skillsx-files-single" width={480}>
          <SkillDetailResourceFiles
            skillId="skill-beta"
            files={['SKILL.md']}
            fileDrafts={{}}
            loadedFileContentsRef={loadedFileContentsRef}
            onFileDraftChange={noop}
          />
        </Case>
        <Case name="skillsx-files-select-target" width={480}>
          <SkillDetailResourceFiles
            skillId="skill-alpha"
            files={['reference.md', 'checklist.md']}
            fileDrafts={{ 'reference.md': 'A pinned draft body.\n' }}
            loadedFileContentsRef={loadedFileContentsRef}
            onFileDraftChange={noop}
          />
        </Case>
      </CaseGroup>
    </div>
  )
}
