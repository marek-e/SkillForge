import { createRoute, useNavigate } from '@tanstack/react-router'
import * as stylex from '@stylexjs/stylex'
import { PlusIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { rootRoute } from './__root'
import { SkillLibraryFilterBar } from '@/components/skill-library/SkillLibraryFilterBar'
import { CreateSkillDialog } from '@/components/skills/CreateSkillDialog'
import { SkillCard } from '@/components/skills/SkillCard'
import { H1, Lead } from '@/components/typography'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { colors, fonts } from '@/styles/tokens.stylex'
import { getToolConfig, originalToolToName } from '@/lib/tool-config'
import { getDefaultSkillView, setDefaultSkillView, type SkillViewMode } from '@/lib/skill-view'
import { useSkills } from '@/hooks/use-skill-library'

/**
 * `space-y-*` is the other child rule on this page, and unlike `divide-y` it
 * migrates: every element it reaches is one this route renders itself, or a
 * StyleX component whose own styles declare no block margin at all
 * (`Skeleton`, `SkillLibraryFilterBar`). Tailwind emits both margins with the
 * start one at zero (`tailwind-values.md` §7); the compiler turns the pair into
 * the physical `margin-top`/`margin-bottom`, which is the same resolution while
 * the document stays `horizontal-tb` (PR 22).
 */
const styles = stylex.create({
  // `space-y-6`
  page: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '1.5rem' },
  },

  // `flex items-start justify-between gap-4`
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
  },

  // `space-y-3`
  loading: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '0.75rem' },
  },

  // `text-sm text-muted-foreground`; a paragraph of plain text with no
  // descendant of its own, so the paired line height is written as the length
  // it resolves to (`conventions.md`, "Paired line-heights").
  mutedText: {
    color: colors.mutedForeground,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },

  // `space-y-4`
  content: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '1rem' },
  },

  // `space-y-2`
  results: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '0.5rem' },
  },

  // `flex items-center gap-2`
  countRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  // `grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3`
  grid: {
    display: 'grid',
    gap: '0.75rem',
    // The two breakpoints are one nested condition rather than two sibling
    // `@media` keys. StyleX prices a condition by nesting depth, so two
    // siblings of equal depth tie, and a tie is not settled by the order the
    // keys appear in `stylex.create` (`conventions.md`, "Utility source order
    // decides a same-specificity tie"). Nested, the wide query outranks the
    // narrow one by that level, and it only matches where both do — the same
    // band `lg:grid-cols-3` covers on its own.
    gridTemplateColumns: {
      default: 'repeat(1, minmax(0, 1fr))',
      '@media (width >= 40rem)': {
        default: 'repeat(2, minmax(0, 1fr))',
        '@media (width >= 64rem)': 'repeat(3, minmax(0, 1fr))',
      },
    },
  },

  // `size-3`, on an `<img>` this route renders itself. No `[class*='size-']`
  // rule reaches it: `badge.tsx`'s icon rule is `[&>svg]:size-3!`, and this
  // element is not an `svg`.
  badgeLogo: {
    width: '0.75rem',
    height: '0.75rem',
  },

  // `dark:invert`. Tailwind routes it through `--tw-invert` into its nine-slot
  // `filter` chain, which computes to the single function below; lightningcss
  // folds the literal `invert(100%)` to `invert()`, the same computed `invert(1)`
  // (PR 22).
  badgeLogoInvert: {
    filter: {
      default: null,
      ':is(.dark *)': 'invert(100%)',
    },
  },
})

export const skillLibraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/skill-library',
  component: SkillLibraryPage,
})

function SkillLibraryPage() {
  const navigate = useNavigate()
  const { data: skills, isLoading } = useSkills()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [viewMode, setViewMode] = useState<SkillViewMode>(() => getDefaultSkillView())

  function handleViewModeChange(mode: SkillViewMode) {
    setViewMode(mode)
    setDefaultSkillView(mode)
  }

  const availableTools = useMemo(() => {
    const tools = new Set(skills?.map((s) => s.originalTool).filter(Boolean))
    return [...tools] as string[]
  }, [skills])

  const availableTags = useMemo(() => {
    const tags = new Set(skills?.flatMap((s) => s.tags))
    return [...tags].sort()
  }, [skills])

  const filteredSkills = useMemo(() => {
    let result = skills ?? []
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      )
    }
    if (selectedTools.length > 0) {
      result = result.filter((s) => s.originalTool && selectedTools.includes(s.originalTool))
    }
    if (selectedTags.length > 0) {
      result = result.filter((s) => selectedTags.every((t) => s.tags.includes(t)))
    }
    return result
  }, [skills, searchQuery, selectedTools, selectedTags])

  function handleToolToggle(tool: string) {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    )
  }

  function handleTagToggle(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const isFiltered =
    searchQuery.trim().length > 0 || selectedTools.length > 0 || selectedTags.length > 0

  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <H1>Skill Library</H1>
          <Lead>Browse and manage reusable skills.</Lead>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <PlusIcon />
          New skill
        </Button>
      </div>

      <CreateSkillDialog open={createOpen} onOpenChange={setCreateOpen} />

      {isLoading ? (
        <div {...stylex.props(styles.loading)}>
          <Skeleton sx={overrideStyles.SKELETON_LABEL_CLASSES} />
          <Skeleton sx={overrideStyles.SKELETON_ROW_CLASSES} />
          <Skeleton sx={overrideStyles.SKELETON_ROW_CLASSES} />
          <Skeleton sx={overrideStyles.SKELETON_ROW_CLASSES} />
        </div>
      ) : !skills || skills.length === 0 ? (
        <p {...stylex.props(styles.mutedText)}>
          No skills saved yet. Save skills from a project to see them here.
        </p>
      ) : (
        <div {...stylex.props(styles.content)}>
          <SkillLibraryFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            availableTools={availableTools}
            selectedTools={selectedTools}
            onToolToggle={handleToolToggle}
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />

          <div {...stylex.props(styles.results)}>
            <div {...stylex.props(styles.countRow)}>
              <Badge variant="secondary" sx={overrideStyles.BADGE_TEXT_CLASSES}>
                {isFiltered
                  ? `${filteredSkills.length} of ${skills.length} ${skills.length === 1 ? 'skill' : 'skills'}`
                  : `${skills.length} ${skills.length === 1 ? 'skill' : 'skills'}`}
              </Badge>
            </div>

            {filteredSkills.length === 0 ? (
              <p {...stylex.props(styles.mutedText)}>No skills match your search.</p>
            ) : viewMode === 'grid' ? (
              <div {...stylex.props(styles.grid)}>
                {filteredSkills.map((skill) => {
                  const toolName = skill.originalTool
                    ? originalToolToName[skill.originalTool]
                    : undefined
                  const config = toolName ? getToolConfig(toolName) : undefined
                  const visibleTags = skill.tags.slice(0, 3)
                  return (
                    <SkillCard
                      key={skill.id}
                      viewMode="grid"
                      name={skill.name}
                      description={skill.description}
                      onClick={() =>
                        navigate({ to: '/skill-library/$skillId', params: { skillId: skill.id } })
                      }
                      badges={
                        <>
                          {config && (
                            <Badge variant="outline" sx={overrideStyles.BADGE_TOOL_CLASSES}>
                              <img
                                src={config.logo}
                                alt={config.displayName}
                                {...stylex.props(
                                  styles.badgeLogo,
                                  config.invert && styles.badgeLogoInvert
                                )}
                              />
                              {config.displayName}
                            </Badge>
                          )}
                          <Badge variant="secondary" sx={overrideStyles.BADGE_TEXT_CLASSES}>
                            {skill.source}
                          </Badge>
                          {skill.scope === 'project-specific' && (
                            <Badge variant="outline" sx={overrideStyles.BADGE_TEXT_CLASSES}>
                              project-specific
                            </Badge>
                          )}
                          {visibleTags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              sx={overrideStyles.BADGE_TAG_CLASSES}
                            >
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </Badge>
                          ))}
                        </>
                      }
                    />
                  )
                })}
              </div>
            ) : (
              <div {...stylex.props(overrideStyles.LIST_CLASSES)}>
                {filteredSkills.map((skill) => {
                  const toolName = skill.originalTool
                    ? originalToolToName[skill.originalTool]
                    : undefined
                  const config = toolName ? getToolConfig(toolName) : undefined
                  const visibleTags = skill.tags.slice(0, 3)
                  return (
                    <SkillCard
                      key={skill.id}
                      viewMode="list"
                      name={skill.name}
                      description={skill.description}
                      onClick={() =>
                        navigate({ to: '/skill-library/$skillId', params: { skillId: skill.id } })
                      }
                      badges={
                        <>
                          {config && (
                            <Badge variant="outline" sx={overrideStyles.BADGE_TOOL_CLASSES}>
                              <img
                                src={config.logo}
                                alt={config.displayName}
                                {...stylex.props(
                                  styles.badgeLogo,
                                  config.invert && styles.badgeLogoInvert
                                )}
                              />
                              {config.displayName}
                            </Badge>
                          )}
                          <Badge variant="secondary" sx={overrideStyles.BADGE_TEXT_CLASSES}>
                            {skill.source}
                          </Badge>
                          {skill.scope === 'project-specific' && (
                            <Badge variant="outline" sx={overrideStyles.BADGE_TEXT_CLASSES}>
                              project-specific
                            </Badge>
                          )}
                          {visibleTags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              sx={overrideStyles.BADGE_TAG_CLASSES}
                            >
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </Badge>
                          ))}
                        </>
                      }
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const overrideStyles = stylex.create({
  SKELETON_LABEL_CLASSES: { height: '1rem', width: '6rem' },
  SKELETON_ROW_CLASSES: { height: '3rem', width: '100%' },
  BADGE_TEXT_CLASSES: { fontSize: '0.75rem', lineHeight: '1rem' },
  BADGE_TOOL_CLASSES: {
    fontSize: '0.75rem',
    lineHeight: '1rem',
    gap: '0.25rem',
    paddingLeft: '0.375rem',
    paddingRight: '0.375rem',
    paddingTop: '0rem',
    paddingBottom: '0rem',
  },
  BADGE_TAG_CLASSES: { fontSize: '0.75rem', lineHeight: '1rem', fontFamily: fonts.mono },
  LIST_CLASSES: {
    borderTopWidth: { default: null, ':is(*)>:not(:last-child)': '0px' },
    borderBottomWidth: { default: null, ':is(*)>:not(:last-child)': '1px' },
    borderBottomStyle: { default: null, ':is(*)>:not(:last-child)': 'solid' },
    borderColor: { default: null, ':is(*)>:not(:last-child)': colors.border },
  },
})
