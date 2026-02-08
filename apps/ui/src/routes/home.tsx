import { createRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { rootRoute } from './__root'
import { api } from '../api/client'
import { ToolCard } from '../components/ToolCard'
import { Skeleton } from '../components/ui/skeleton'

function HomePage() {
  const { data: tools, isLoading: toolsLoading, error: toolsError } = useQuery({
    queryKey: ['tools'],
    queryFn: api.tools.list,
  })

  const { data: commands, isLoading: commandsLoading } = useQuery({
    queryKey: ['tools', 'claude-code', 'commands'],
    queryFn: api.tools.claudeCodeCommands,
  })

  const { data: skills, isLoading: skillsLoading } = useQuery({
    queryKey: ['tools', 'claude-code', 'skills'],
    queryFn: api.tools.claudeCodeSkills,
  })

  const isLoading = toolsLoading || commandsLoading || skillsLoading

  if (toolsError) {
    return (
      <div className="text-destructive">
        Error loading tools: {(toolsError as Error).message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Your AI Tools</h1>
        <p className="text-muted-foreground mt-1">
          Visualize, manage, and normalize agent skills across tools.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid gap-6">
          {tools?.map((tool) => (
            <ToolCard
              key={tool.name}
              tool={tool}
              commands={tool.name === 'claude-code' ? commands : undefined}
              skills={tool.name === 'claude-code' ? skills : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})
