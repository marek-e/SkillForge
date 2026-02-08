import { createRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { rootRoute } from './__root'
import { api } from '../api/client'
import {
  ClaudeCodeCard,
  CursorCard,
  CodexCard,
  GeminiCliCard,
  OpenCodeCard,
} from '../components/ToolCard'
import { Skeleton } from '../components/ui/skeleton'

function HomePage() {
  const {
    data: tools,
    isLoading: toolsLoading,
    error: toolsError,
  } = useQuery({
    queryKey: ['tools'],
    queryFn: api.tools.list,
  })

  const { data: claudeCommands, isLoading: claudeCommandsLoading } = useQuery({
    queryKey: ['tools', 'claude-code', 'commands'],
    queryFn: api.tools.claudeCodeCommands,
  })

  const { data: claudeSkills, isLoading: claudeSkillsLoading } = useQuery({
    queryKey: ['tools', 'claude-code', 'skills'],
    queryFn: api.tools.claudeCodeSkills,
  })

  const { data: cursorSkills, isLoading: cursorSkillsLoading } = useQuery({
    queryKey: ['tools', 'cursor', 'skills'],
    queryFn: api.tools.cursorSkills,
  })

  const { data: codexSkills, isLoading: codexSkillsLoading } = useQuery({
    queryKey: ['tools', 'codex', 'skills'],
    queryFn: api.tools.codexSkills,
  })

  const { data: geminiCliSkills, isLoading: geminiCliSkillsLoading } = useQuery({
    queryKey: ['tools', 'gemini-cli', 'skills'],
    queryFn: api.tools.geminiCliSkills,
  })

  const { data: openCodeSkills, isLoading: openCodeSkillsLoading } = useQuery({
    queryKey: ['tools', 'opencode', 'skills'],
    queryFn: api.tools.openCodeSkills,
  })

  const isLoading =
    toolsLoading ||
    claudeCommandsLoading ||
    claudeSkillsLoading ||
    cursorSkillsLoading ||
    codexSkillsLoading ||
    geminiCliSkillsLoading ||
    openCodeSkillsLoading

  if (toolsError) {
    return (
      <div className="text-destructive">Error loading tools: {(toolsError as Error).message}</div>
    )
  }

  const claudeCodeTool = tools?.find((t) => t.name === 'claude-code')
  const cursorTool = tools?.find((t) => t.name === 'cursor')
  const codexTool = tools?.find((t) => t.name === 'codex')
  const geminiCliTool = tools?.find((t) => t.name === 'gemini-cli')
  const openCodeTool = tools?.find((t) => t.name === 'opencode')

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
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid gap-6">
          {claudeCodeTool && (
            <ClaudeCodeCard tool={claudeCodeTool} commands={claudeCommands} skills={claudeSkills} />
          )}
          {cursorTool && <CursorCard tool={cursorTool} skills={cursorSkills} />}
          {codexTool && <CodexCard tool={codexTool} skills={codexSkills} />}
          {geminiCliTool && <GeminiCliCard tool={geminiCliTool} skills={geminiCliSkills} />}
          {openCodeTool && <OpenCodeCard tool={openCodeTool} skills={openCodeSkills} />}
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
