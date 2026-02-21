import { createRoute, useNavigate } from '@tanstack/react-router'
import type { Skill } from '@skillforge/core'
import { PlusIcon, WrenchIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { rootRoute } from './__root'
import { SkillLibraryFilterBar } from '@/components/skill-library/SkillLibraryFilterBar'
import { CreateSkillDialog } from '@/components/skills/CreateSkillDialog'
import { H1, Lead } from '@/components/typography'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getToolConfig } from '@/lib/tool-config'
import { useSkills } from '@/hooks/use-skill-library'

const originalToolToName: Record<NonNullable<Skill['originalTool']>, string> = {
  claude: 'claude-code',
  cursor: 'cursor',
  openai: 'codex',
  gemini: 'gemini-cli',
  generic: 'opencode',
}

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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
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
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : !skills || skills.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No skills saved yet. Save skills from a project to see them here.
        </p>
      ) : (
        <div className="space-y-4">
          <SkillLibraryFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            availableTools={availableTools}
            selectedTools={selectedTools}
            onToolToggle={handleToolToggle}
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
          />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {isFiltered
                  ? `${filteredSkills.length} of ${skills.length} ${skills.length === 1 ? 'skill' : 'skills'}`
                  : `${skills.length} ${skills.length === 1 ? 'skill' : 'skills'}`}
              </Badge>
            </div>

            {filteredSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No skills match your search.</p>
            ) : (
              <div className="divide-y divide-border">
                {filteredSkills.map((skill) => {
                  const toolName = skill.originalTool
                    ? originalToolToName[skill.originalTool]
                    : undefined
                  const config = toolName ? getToolConfig(toolName) : undefined
                  const visibleTags = skill.tags.slice(0, 3)
                  return (
                    <div
                      key={skill.id}
                      className="flex items-start gap-3 py-2.5 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded"
                      onClick={() =>
                        navigate({ to: '/skill-library/$skillId', params: { skillId: skill.id } })
                      }
                    >
                      <WrenchIcon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{skill.name}</span>
                          {config && (
                            <Badge variant="outline" className="text-xs gap-1 px-1.5 py-0">
                              <img
                                src={config.logo}
                                alt={config.displayName}
                                className={`size-3 ${config.invert ? 'dark:invert' : ''}`}
                              />
                              {config.displayName}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {skill.source}
                          </Badge>
                          {skill.scope === 'project-specific' && (
                            <Badge variant="outline" className="text-xs">
                              project-specific
                            </Badge>
                          )}
                          {visibleTags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs font-mono">
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{skill.description}</p>
                      </div>
                    </div>
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
