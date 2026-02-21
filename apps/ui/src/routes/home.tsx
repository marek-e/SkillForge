import { createRoute, useNavigate } from '@tanstack/react-router'
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
import { getToolConfig, originalToolToName } from '@/lib/tool-config'
import { useHomeData } from '@/hooks/use-home'

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
    <div className="space-y-10">
      <div className="space-y-2">
        <H1>Welcome to SkillForge</H1>
        <Lead>Visualize and manage agent skills across tools and projects.</Lead>
        {!isLoading && (
          <p className="text-sm text-muted-foreground">
            {connectedTools.length} tool{connectedTools.length !== 1 ? 's' : ''} connected
            {' \u00B7 '}
            {totalSkills} skill{totalSkills !== 1 ? 's' : ''} saved
            {' \u00B7 '}
            {totalProjects} project{totalProjects !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Connected Tools */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <H2 className="flex items-center gap-2">
            <Toolbox /> Connected Tools
          </H2>
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate({ to: '/tools' })}
          >
            All tools
            <ArrowRightIcon className="size-3.5" />
          </button>
        </div>

        {toolsLoading ? (
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-36 w-full rounded-xl sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)]"
              />
            ))}
          </div>
        ) : connectedTools.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tools detected yet. Visit{' '}
            <button
              type="button"
              className="underline hover:text-foreground transition-colors"
              onClick={() => navigate({ to: '/tools' })}
            >
              Tools
            </button>{' '}
            to see available integrations.
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            {connectedTools.slice(0, 5).map((tool) => (
              <div
                key={tool.name}
                className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)]"
              >
                <ToolCardCompact tool={tool} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <H2 className="flex items-center gap-2">
            <BookCopy />
            Skill Library
          </H2>
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate({ to: '/skill-library' })}
          >
            All skills
            <ArrowRightIcon className="size-3.5" />
          </button>
        </div>

        {skillsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : recentSkills.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No skills saved yet. Save skills from a project to see them here.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {recentSkills.map((skill) => {
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
                    </div>
                    {skill.description && (
                      <p className="text-sm text-muted-foreground truncate">{skill.description}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <H2 className="flex items-center gap-2">
            <TrafficCone /> Recent Projects
          </H2>
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate({ to: '/projects' })}
          >
            All projects
            <ArrowRightIcon className="size-3.5" />
          </button>
        </div>

        {projectsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : recentProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No projects yet. Add a project to start managing skills.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {recentProjects.map((project) => {
              const detectedCount = project.detectedTools.filter((t) => t.detected).length
              return (
                <div
                  key={project.id}
                  className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded"
                  onClick={() =>
                    navigate({
                      to: '/projects/$projectId',
                      params: { projectId: project.id },
                    })
                  }
                >
                  {project.isFavorite ? (
                    <StarIcon className="size-4 text-amber-500 fill-amber-500 shrink-0" />
                  ) : (
                    <FolderOpenIcon className="size-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-sm">{project.name}</span>
                    <p className="text-xs text-muted-foreground truncate">{project.path}</p>
                  </div>
                  {detectedCount > 0 && (
                    <Badge variant="secondary" className="text-xs shrink-0">
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
