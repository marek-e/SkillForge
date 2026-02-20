import { createRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { rootRoute } from './__root'
import { api, queryKeys } from '../api/client'
import { getToolConfig } from '@/lib/tool-config'
import { ToolCard } from '../components/ToolCard'
import { ErrorContainer } from '../components/ErrorContainer'
import { Skeleton } from '../components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { SkillItem } from '@skillforge/core'
import { H1 } from '@/components/typography'
import { useBreadcrumb } from '@/lib/breadcrumbs'

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
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={cn('flex size-10 items-center justify-center rounded-lg', config.accent)}>
          <img
            src={config.logo}
            alt={config.displayName}
            className={cn('size-6', config.invert && 'dark:invert')}
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
