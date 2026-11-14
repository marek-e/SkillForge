import * as stylex from '@stylexjs/stylex'
import { createRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { rootRoute } from './__root'
import { api, queryKeys } from '../api/client'
import { ToolCardCompact } from '../components/ToolCardCompact'
import { ErrorContainer } from '../components/ErrorContainer'
import { H1 } from '../components/typography'
import { Lead } from '../components/typography'
import { Skeleton } from '../components/ui/skeleton'
import { colors, radius } from '@/styles/tokens.stylex'

const styles = stylex.create({
  // `space-y-8`.
  //
  // `space-y-*` is a child rule (`:where(& > :not(:last-child))`), and the
  // children are the header block and the card grid below, both rendered by
  // this route. Tailwind emits both margins, the start one at zero
  // (`tailwind-values.md` §7).
  page: {
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '2rem',
    },
  },
  // `space-y-2`, the same child rule over the heading, the lead paragraph and
  // the counts line — `H1` and `Lead` declare no margin of their own.
  header: {
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '0.5rem',
    },
  },
  // `text-sm text-muted-foreground`; the paired line height written as the
  // length it resolves to (conventions.md, "Paired line-heights"). The
  // paragraph holds text only, so nothing below it inherits a ratio.
  counts: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: colors.mutedForeground,
  },
  // `flex flex-wrap justify-center gap-4`
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '1rem',
  },
  // `w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)]`: one card per
  // row, then two, then three. `sm:` is `@media (width >= 40rem)` and `lg:`
  // `@media (width >= 64rem)`; the compiler makes the later key win by negating
  // it out of the earlier one, so the order here is Tailwind's own.
  gridItem: {
    width: {
      default: '100%',
      '@media (width >= 40rem)': 'calc(50% - 0.5rem)',
      '@media (width >= 64rem)': 'calc(33.333% - 0.75rem)',
    },
  },
})

function ToolsPage() {
  const {
    data: tools,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.tools.lists(),
    queryFn: api.tools.list,
  })

  if (error) {
    return (
      <ErrorContainer
        title="Failed to load tools"
        message={error.message}
        onRetry={() => refetch()}
      />
    )
  }

  const connectedCount = tools?.filter((t) => t.detected).length ?? 0
  const totalSkills = tools?.reduce((sum, t) => sum + t.skillCount, 0) ?? 0

  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.header)}>
        <H1>Your AI Tools</H1>
        <Lead>Visualize, manage, and normalize agent skills across tools.</Lead>
        {tools && (
          <p {...stylex.props(styles.counts)}>
            {connectedCount} connected · {totalSkills} total skill
            {totalSkills !== 1 && 's'}
          </p>
        )}
      </div>

      {isLoading ? (
        <div {...stylex.props(styles.grid)}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} sx={overrideStyles.SKELETON_CLASSES} />
          ))}
        </div>
      ) : (
        <div {...stylex.props(styles.grid)}>
          {tools?.map((tool) => (
            <div key={tool.name} {...stylex.props(styles.gridItem)}>
              <ToolCardCompact tool={tool} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export const toolsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tools',
  component: ToolsPage,
})

const overrideStyles = stylex.create({
  SKELETON_CLASSES: {
    height: '9rem',
    width: {
      default: '100%',
      '@media (width >= 40rem)': 'calc(50% - 0.5rem)',
      '@media (width >= 64rem)': 'calc(33.333% - 0.75rem)',
    },
    borderRadius: radius.xl,
  },
})
