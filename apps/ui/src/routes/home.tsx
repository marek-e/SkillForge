import { createRoute, useNavigate } from '@tanstack/react-router'
import * as stylex from '@stylexjs/stylex'
import {
  WrenchIcon,
  FolderOpenIcon,
  ArrowRightIcon,
  StarIcon,
  Toolbox,
  BookCopy,
  TrafficCone,
} from 'lucide-react'
import { rootRoute } from './__root'
import { ToolCardCompact } from '../components/ToolCardCompact'
import { H1, H2, Lead } from '../components/typography'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { colors, motion, radius } from '@/styles/tokens.stylex'
import { getToolConfig, originalToolToName } from '@/lib/tool-config'
import { useHomeData } from '@/hooks/use-home'

/**
 * `transition-colors`, written out (`tailwind-values.md` §8).
 *
 * The same string `ToolCardCompact.tsx` uses, so the declaration dedupes onto
 * the atomic class that file already emits. The `--tw-gradient-*` entries are
 * part of the utility's property list and are kept so the computed
 * `transition-property` is unchanged.
 */
const TRANSITION_COLORS =
  'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to'

/** `bg-muted/50`, the opacity modifier compiled (`tailwind-values.md` §4). */
const MUTED_50 = 'color-mix(in oklab, var(--muted) 50%, transparent)'

/** `text-amber-500` / `fill-amber-500` (`tailwind-values.md` §4). */
const AMBER_500 = 'oklch(76.9% 0.188 70.08)'

const styles = stylex.create({
  // `space-y-10`.
  //
  // `space-y-*` is a child rule — `:where(& > :not(:last-child))` — and every
  // element each of these four reaches is one this route renders itself, so it
  // migrates (PR 22, PR 27). Tailwind emits both margins with the start one at
  // zero (`tailwind-values.md` §7); the compiler turns the logical pair into
  // the physical `margin-top`/`margin-bottom`, the same resolution while the
  // document stays `horizontal-tb`.
  page: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '2.5rem' },
  },

  // `space-y-2`, over `H1`, `Lead` and the counts paragraph — none of the
  // typography components declares a block margin of its own.
  intro: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '0.5rem' },
  },

  // `space-y-4`, over each section's header row and its body.
  section: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '1rem' },
  },

  // `space-y-3`, over the loading placeholders of the last two sections.
  rowSkeletons: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '0.75rem' },
  },

  // `text-sm text-muted-foreground`; the paired line height written as the
  // length it resolves to (`conventions.md`, "Paired line-heights"). The one
  // descendant any of these paragraphs has is the `Tools` button below, which
  // preflight gives `font: inherit`, so it inherits the same size and the same
  // line box either way.
  mutedText: {
    color: colors.mutedForeground,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },

  // `flex items-center justify-between`, the row above each section's body.
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // `flex items-center gap-1 text-sm text-muted-foreground
  //  hover:text-foreground transition-colors`
  sectionLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: {
      default: colors.mutedForeground,
      '@media (hover: hover)': { default: null, ':hover': colors.foreground },
    },
    transitionProperty: TRANSITION_COLORS,
    transitionDuration: motion.duration,
    transitionTimingFunction: motion.ease,
  },

  // `size-3.5`, on an icon this route renders directly inside a `button` it
  // also renders. Nothing here reads the class text, so no `[class*='size-']`
  // contract applies (PR 29).
  sectionLinkIcon: {
    width: '0.875rem',
    height: '0.875rem',
  },

  // `flex flex-wrap gap-4`
  toolsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
  },

  // `justify-center`, which only the populated row carries — the loading row is
  // plain `flex flex-wrap gap-4`.
  toolsRowCentered: {
    justifyContent: 'center',
  },

  // `w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)]`: one card per
  // row, then two, then three. The identical declaration in `tools.tsx`
  // (PR 26), down to the key order, so it dedupes onto the atomic classes that
  // route already emits. `enableMediaQueryOrder` makes the later key win by
  // negating it out of the earlier one, which is Tailwind's own order; the
  // 0.16px band the rewrite leaves between the two queries is the toolchain's
  // and is documented there.
  toolsRowItem: {
    width: {
      default: '100%',
      '@media (width >= 40rem)': 'calc(50% - 0.5rem)',
      '@media (width >= 64rem)': 'calc(33.333% - 0.75rem)',
    },
  },

  // `underline hover:text-foreground transition-colors`, the inline button in
  // the "no tools detected" paragraph. It inherits its colour from that
  // paragraph, so only the hover state names one.
  inlineLink: {
    textDecorationLine: 'underline',
    color: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': colors.foreground },
    },
    transitionProperty: TRANSITION_COLORS,
    transitionDuration: motion.duration,
    transitionTimingFunction: motion.ease,
  },

  // `flex gap-3 py-2.5 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded`,
  // shared by the skill rows and the project rows. `-mx-*`, `px-*` and `py-*`
  // are all logical as Tailwind writes them (`conventions.md`), and `rounded`
  // is the built-in `0.25rem`, not a step of the project's `--radius` scale.
  row: {
    display: 'flex',
    gap: '0.75rem',
    paddingBlock: '0.625rem',
    cursor: 'pointer',
    backgroundColor: {
      default: null,
      '@media (hover: hover)': { default: null, ':hover': MUTED_50 },
    },
    marginInline: '-0.5rem',
    paddingInline: '0.5rem',
    borderRadius: '0.25rem',
  },

  // `items-start`, on the skill rows only.
  rowItemsStart: {
    alignItems: 'flex-start',
  },

  // `items-center`, on the project rows only.
  rowItemsCenter: {
    alignItems: 'center',
  },

  // `size-4 text-muted-foreground mt-0.5 shrink-0`, the skill row's wrench.
  skillIcon: {
    width: '1rem',
    height: '1rem',
    flexShrink: 0,
    marginTop: '0.125rem',
    color: colors.mutedForeground,
  },

  // `size-4 text-amber-500 fill-amber-500 shrink-0`, the favourite star. Both
  // colour utilities name the same palette entry, one for the stroke and one
  // for the fill.
  favoriteIcon: {
    width: '1rem',
    height: '1rem',
    flexShrink: 0,
    color: AMBER_500,
    fill: AMBER_500,
  },

  // `size-4 text-muted-foreground shrink-0`, the folder on a project that is
  // not a favourite.
  projectIcon: {
    width: '1rem',
    height: '1rem',
    flexShrink: 0,
    color: colors.mutedForeground,
  },

  // `min-w-0 flex-1`, the text column of both row shapes. `flex-1` compiles to
  // the `flex: 1` shorthand in Tailwind v4 (`progress.tsx`); the three
  // longhands are what it expands to, and what `SkillCard` writes.
  rowBody: {
    minWidth: '0rem',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
  },

  // `flex items-center gap-2 flex-wrap`, the skill row's name-and-badge line.
  rowTitleLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },

  // `font-medium text-sm`, the name of a skill or a project.
  rowTitle: {
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },

  // `text-xs text-muted-foreground`, the project path.
  rowPath: {
    color: colors.mutedForeground,
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },

  // `truncate`
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // `size-3`, on an `<img>` this route renders itself. `badge.tsx`'s icon rule
  // is `[&>svg]:size-3!` and this element is not an `svg`, so no rule reads the
  // class text (PR 27).
  badgeLogo: {
    width: '0.75rem',
    height: '0.75rem',
  },

  // `dark:invert`. Tailwind routes it through `--tw-invert` into its nine-slot
  // `filter` chain, which computes to the single function below; lightningcss
  // folds the literal `invert(100%)` to the same computed value (PR 22).
  badgeLogoInvert: {
    filter: {
      default: null,
      ':is(.dark *)': 'invert(100%)',
    },
  },
})

function HomePage() {
  const navigate = useNavigate()
  const {
    connectedTools,
    totalSkills,
    totalProjects,
    recentSkills,
    recentProjects,
    isLoading,
    toolsLoading,
    skillsLoading,
    projectsLoading,
  } = useHomeData()

  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.intro)}>
        <H1>Welcome to SkillForge</H1>
        <Lead>Visualize and manage agent skills across tools and projects.</Lead>
        {!isLoading && (
          <p {...stylex.props(styles.mutedText)}>
            {connectedTools.length} tool{connectedTools.length !== 1 ? 's' : ''} connected
            {' · '}
            {totalSkills} skill{totalSkills !== 1 ? 's' : ''} saved
            {' · '}
            {totalProjects} project{totalProjects !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Connected Tools */}
      <section {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.sectionHeader)}>
          <H2 sx={routeStyles.sectionTitle}>
            <Toolbox /> Connected Tools
          </H2>
          <button
            type="button"
            {...stylex.props(styles.sectionLink)}
            onClick={() => navigate({ to: '/tools' })}
          >
            All tools
            <ArrowRightIcon {...stylex.props(styles.sectionLinkIcon)} />
          </button>
        </div>

        {toolsLoading ? (
          <div {...stylex.props(styles.toolsRow)}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} sx={routeStyles.toolSkeleton} />
            ))}
          </div>
        ) : connectedTools.length === 0 ? (
          <p {...stylex.props(styles.mutedText)}>
            No tools detected yet. Visit{' '}
            <button
              type="button"
              {...stylex.props(styles.inlineLink)}
              onClick={() => navigate({ to: '/tools' })}
            >
              Tools
            </button>{' '}
            to see available integrations.
          </p>
        ) : (
          <div {...stylex.props(styles.toolsRow, styles.toolsRowCentered)}>
            {connectedTools.slice(0, 5).map((tool) => (
              <div key={tool.name} {...stylex.props(styles.toolsRowItem)}>
                <ToolCardCompact tool={tool} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.sectionHeader)}>
          <H2 sx={routeStyles.sectionTitle}>
            <BookCopy />
            Skill Library
          </H2>
          <button
            type="button"
            {...stylex.props(styles.sectionLink)}
            onClick={() => navigate({ to: '/skill-library' })}
          >
            All skills
            <ArrowRightIcon {...stylex.props(styles.sectionLinkIcon)} />
          </button>
        </div>

        {skillsLoading ? (
          <div {...stylex.props(styles.rowSkeletons)}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} sx={routeStyles.rowSkeleton} />
            ))}
          </div>
        ) : recentSkills.length === 0 ? (
          <p {...stylex.props(styles.mutedText)}>
            No skills saved yet. Save skills from a project to see them here.
          </p>
        ) : (
          <div {...stylex.props(routeStyles.rowList)}>
            {recentSkills.map((skill) => {
              const toolName = skill.originalTool
                ? originalToolToName[skill.originalTool]
                : undefined
              const config = toolName ? getToolConfig(toolName) : undefined
              return (
                <div
                  key={skill.id}
                  {...stylex.props(styles.row, styles.rowItemsStart)}
                  onClick={() =>
                    navigate({ to: '/skill-library/$skillId', params: { skillId: skill.id } })
                  }
                >
                  <WrenchIcon {...stylex.props(styles.skillIcon)} />
                  <div {...stylex.props(styles.rowBody)}>
                    <div {...stylex.props(styles.rowTitleLine)}>
                      <span {...stylex.props(styles.rowTitle)}>{skill.name}</span>
                      {config && (
                        <Badge variant="outline" sx={routeStyles.toolBadge}>
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
                    </div>
                    {skill.description && (
                      <p {...stylex.props(styles.mutedText, styles.truncate)}>
                        {skill.description}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.sectionHeader)}>
          <H2 sx={routeStyles.sectionTitle}>
            <TrafficCone /> Recent Projects
          </H2>
          <button
            type="button"
            {...stylex.props(styles.sectionLink)}
            onClick={() => navigate({ to: '/projects' })}
          >
            All projects
            <ArrowRightIcon {...stylex.props(styles.sectionLinkIcon)} />
          </button>
        </div>

        {projectsLoading ? (
          <div {...stylex.props(styles.rowSkeletons)}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} sx={routeStyles.rowSkeleton} />
            ))}
          </div>
        ) : recentProjects.length === 0 ? (
          <p {...stylex.props(styles.mutedText)}>
            No projects yet. Add a project to start managing skills.
          </p>
        ) : (
          <div {...stylex.props(routeStyles.rowList)}>
            {recentProjects.map((project) => {
              const detectedCount = project.detectedTools.filter((t) => t.detected).length
              return (
                <div
                  key={project.id}
                  {...stylex.props(styles.row, styles.rowItemsCenter)}
                  onClick={() =>
                    navigate({
                      to: '/projects/$projectId',
                      params: { projectId: project.id },
                    })
                  }
                >
                  {project.isFavorite ? (
                    <StarIcon {...stylex.props(styles.favoriteIcon)} />
                  ) : (
                    <FolderOpenIcon {...stylex.props(styles.projectIcon)} />
                  )}
                  <div {...stylex.props(styles.rowBody)}>
                    <span {...stylex.props(styles.rowTitle)}>{project.name}</span>
                    <p {...stylex.props(styles.rowPath, styles.truncate)}>{project.path}</p>
                  </div>
                  {detectedCount > 0 && (
                    <Badge variant="secondary" sx={routeStyles.countBadge}>
                      {detectedCount} tool{detectedCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const routeStyles = stylex.create({
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  toolSkeleton: {
    height: '9rem',
    width: {
      default: '100%',
      '@media (width >= 40rem)': 'calc(50% - 0.5rem)',
      '@media (width >= 64rem)': 'calc(33.333% - 0.75rem)',
    },
    borderRadius: radius.xl,
  },
  rowSkeleton: { height: '3rem', width: '100%', borderRadius: radius.lg },
  toolBadge: {
    gap: '0.25rem',
    paddingLeft: '0.375rem',
    paddingRight: '0.375rem',
    paddingTop: '0rem',
    paddingBottom: '0rem',
  },
  countBadge: { flexShrink: 0 },
  rowList: {
    borderTopWidth: { default: null, ':is(*)>:not(:last-child)': '0px' },
    borderBottomWidth: { default: null, ':is(*)>:not(:last-child)': '1px' },
    borderBottomStyle: { default: null, ':is(*)>:not(:last-child)': 'solid' },
    borderColor: { default: null, ':is(*)>:not(:last-child)': colors.border },
  },
})
