import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

export function useToolsData() {
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

  return {
    tools,
    claudeCommands,
    claudeSkills,
    cursorSkills,
    codexSkills,
    geminiCliSkills,
    openCodeSkills,
    isLoading,
    toolsError,
  }
}
