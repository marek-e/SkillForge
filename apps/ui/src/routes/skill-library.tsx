import { createRoute, useNavigate } from '@tanstack/react-router'
import type { Skill } from '@skillforge/core'
import { WrenchIcon } from 'lucide-react'
import { rootRoute } from './__root'
import { H1, Lead } from '@/components/typography'
import { Badge } from '@/components/ui/badge'
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

  return (
    <div className="space-y-6">
      <div>
        <H1>Skill Library</H1>
        <Lead>Browse and manage reusable skills.</Lead>
      </div>

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
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {skills.length} {skills.length === 1 ? 'skill' : 'skills'}
            </Badge>
          </div>
          <div className="divide-y divide-border">
            {skills.map((skill) => {
              const toolName = skill.originalTool
                ? originalToolToName[skill.originalTool]
                : undefined
              const config = toolName ? getToolConfig(toolName) : undefined
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
                    </div>
                    <p className="text-sm text-muted-foreground">{skill.description}</p>
                    {skill.implementationRef && (
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {skill.implementationRef}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
