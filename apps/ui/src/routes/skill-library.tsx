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
import { colors } from '@/styles/tokens.stylex'
import { getToolConfig, originalToolToName } from '@/lib/tool-config'
import { getDefaultSkillView, setDefaultSkillView, type SkillViewMode } from '@/lib/skill-view'
import { useSkills } from '@/hooks/use-skill-library'

/**
 * The class lists this route hands to a component it does not own, kept as
 * Tailwind for now (PR 32 removes them).
 *
 * `Skeleton` and `Badge` are StyleX already but take no `sx` prop, so a
 * caller's override still arrives as a `className` their `cn` appends — which
 * is also what keeps these overrides winning, since a utility outranks a
 * `priorityN` rule. `Badge`'s own base already declares `text-xs`, so the count,
 * source, scope and tag badges pass it redundantly; it is kept verbatim anyway,
 * because dropping a class is a behaviour change this row may not make. Both
 * forms measure `12px` / `16px` — the utility's `calc(1 / 0.75)` ratio and the
 * base's `1rem` land on the same line box.
 *
 * `divide-y divide-border` is a child rule — `:where(& > :not(:last-child))` —
 * over the row wrappers `SkillCard` renders in list mode, so it styles elements
 * this route only wraps. It also composes through `--tw-border-style` and
 * `--tw-divide-y-reverse`, variables a StyleX declaration cannot write, so it
 * stays whole, exactly as `SkillDetailResourceFiles` kept its own `divide-y`
 * in PR 23.
 */
const SKELETON_LABEL_CLASSES = 'h-4 w-24'
const SKELETON_ROW_CLASSES = 'h-12 w-full'
const BADGE_TEXT_CLASSES = 'text-xs'
const BADGE_TOOL_CLASSES = 'text-xs gap-1 px-1.5 py-0'
const BADGE_TAG_CLASSES = 'text-xs font-mono'
const LIST_CLASSES = 'divide-y divide-border'

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
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '1.5rem',
    },
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
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '0.75rem',
    },
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
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '1rem',
    },
  },

  // `space-y-2`
  results: {
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '0.5rem',
    },
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
          <Skeleton className={SKELETON_LABEL_CLASSES} />
          <Skeleton className={SKELETON_ROW_CLASSES} />
          <Skeleton className={SKELETON_ROW_CLASSES} />
          <Skeleton className={SKELETON_ROW_CLASSES} />
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
              <Badge variant="secondary" className={BADGE_TEXT_CLASSES}>
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
                            <Badge variant="outline" className={BADGE_TOOL_CLASSES}>
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
                          <Badge variant="secondary" className={BADGE_TEXT_CLASSES}>
                            {skill.source}
                          </Badge>
                          {skill.scope === 'project-specific' && (
                            <Badge variant="outline" className={BADGE_TEXT_CLASSES}>
                              project-specific
                            </Badge>
                          )}
                          {visibleTags.map((tag) => (
                            <Badge key={tag} variant="secondary" className={BADGE_TAG_CLASSES}>
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
              <div className={LIST_CLASSES}>
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
                            <Badge variant="outline" className={BADGE_TOOL_CLASSES}>
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
                          <Badge variant="secondary" className={BADGE_TEXT_CLASSES}>
                            {skill.source}
                          </Badge>
                          {skill.scope === 'project-specific' && (
                            <Badge variant="outline" className={BADGE_TEXT_CLASSES}>
                              project-specific
                            </Badge>
                          )}
                          {visibleTags.map((tag) => (
                            <Badge key={tag} variant="secondary" className={BADGE_TAG_CLASSES}>
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
