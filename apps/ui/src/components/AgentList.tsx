import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import type { Agent } from '@skillforge/core'

export function AgentList() {
  const {
    data: agents,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['agents'],
    queryFn: api.agents.list,
  })

  if (isLoading) return <div className="text-muted-foreground">Loading agents...</div>
  if (error) return <div className="text-destructive">Error: {(error as Error).message}</div>

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Agents</h2>
      <div className="grid gap-4">
        {agents?.map((agent: Agent) => (
          <div key={agent.id} className="bg-card p-4 rounded-lg shadow border">
            <h3 className="font-semibold text-lg">{agent.name}</h3>
            <p className="text-sm text-muted-foreground">Source: {agent.sourceTool}</p>
            <p className="text-sm text-muted-foreground">
              Skills: {agent.enabledSkills.length} enabled
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
