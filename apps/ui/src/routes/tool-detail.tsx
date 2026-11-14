import * as stylex from '@stylexjs/stylex'
import { createRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { rootRoute } from './__root'
import { api, queryKeys } from '../api/client'
import { getToolConfig } from '@/lib/tool-config'
import { ToolCard } from '../components/ToolCard'
import { ErrorContainer } from '../components/ErrorContainer'
import { Skeleton } from '../components/ui/skeleton'
import { radius } from '@/styles/tokens.stylex'
import type { SkillItem } from '@skillforge/core'
import { H1 } from '@/components/typography'
import { useBreadcrumb } from '@/lib/breadcrumbs'

const styles = stylex.create({
  // `space-y-6`.
  //
  // `space-y-*` is a child rule (`:where(& > :not(:last-child))`); the children
  // are the title row and the `ToolCard` below it — or the two skeletons of the
  // loading branch — and none of them declares a margin. Tailwind emits both
  // margins, the start one at zero (`tailwind-values.md` §7).
  page: {
    ':is(*)>:not(:last-child)': {
      marginBlockStart: '0rem',
      marginBlockEnd: '1.5rem',
    },
  },
  // `flex items-center gap-3`
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  // `flex size-10 items-center justify-center rounded-lg`; the accent colour is
  // the class `lib/tool-config.ts` supplies, see below. Same box as
  // `ToolCardCompact`'s logo (PR 22).
  logo: {
    display: 'flex',
    width: '2.5rem',
    height: '2.5rem',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  // `size-6`
  logoImage: {
    width: '1.5rem',
    height: '1.5rem',
  },
  // `dark:invert`. Tailwind's `invert` sets `--tw-invert: invert(100%)` inside
  // a `filter` chain whose other slots are empty, so the computed filter is
  // that one function (`tailwind-values.md` §8).
  logoImageInverted: {
    filter: { default: null, ':is(.dark *)': 'invert(100%)' },
  },
})

const skillsQueryMap: Record<string, () => Promise<SkillItem[]>> = {
  'claude-code': api.tools.claudeCodeSkills,
  cursor: api.tools.cursorSkills,
  codex: api.tools.codexSkills,
  'gemini-cli': api.tools.geminiCliSkills,
  opencode: api.tools.openCodeSkills,
  copilot: api.tools.copilotSkills,
  vibe: api.tools.vibeSkills,
}

function ToolDetailPage() {
  const { name } = toolDetailRoute.useParams()
  const config = getToolConfig(name)
  useBreadcrumb(`/tools/${name}`, config.displayName)

  const { data: tools, isLoading: toolsLoading } = useQuery({
    queryKey: queryKeys.tools.lists(),
    queryFn: api.tools.list,
  })

  const { data: commands } = useQuery({
    queryKey: queryKeys.tools.commands(name),
    queryFn: api.tools.claudeCodeCommands,
    enabled: name === 'claude-code',
  })

  const { data: skills } = useQuery({
    queryKey: queryKeys.tools.skills(name),
    queryFn: skillsQueryMap[name],
    enabled: !!skillsQueryMap[name],
  })

  const tool = tools?.find((t) => t.name === name)

  if (toolsLoading) {
    return (
      <div {...stylex.props(styles.page)}>
        <Skeleton sx={overrideStyles.TITLE_SKELETON_CLASSES} />
        <Skeleton sx={overrideStyles.BODY_SKELETON_CLASSES} />
      </div>
    )
  }

  if (!tool) {
    return (
      <ErrorContainer
        title="Tool not found"
        message={`No tool named "${name}" was found.`}
        backTo="/"
        backLabel="Back to tools"
      />
    )
  }

  // `config.accent` (e.g. `bg-orange-500/15`) is a class name chosen in
  // `lib/tool-config.ts`, which this row does not touch, so it stays a utility
  // on the logo box alongside the StyleX class (as in `ToolCardCompact`).
  const logoSx = stylex.props(styles.logo, config.accent)

  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.header)}>
        <div className={logoSx.className}>
          <img
            src={config.logo}
            alt={config.displayName}
            {...stylex.props(styles.logoImage, config.invert && styles.logoImageInverted)}
          />
        </div>
        <H1>{config.displayName}</H1>
      </div>

      <ToolCard
        tool={tool}
        displayName={config.displayName}
        commands={commands}
        skills={skills}
        showCommands={name === 'claude-code'}
      />
    </div>
  )
}

export const toolDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tools/$name',
  component: ToolDetailPage,
})

const overrideStyles = stylex.create({
  TITLE_SKELETON_CLASSES: { height: '2rem', width: '12rem' },
  BODY_SKELETON_CLASSES: { height: '16rem', width: '100%' },
})
