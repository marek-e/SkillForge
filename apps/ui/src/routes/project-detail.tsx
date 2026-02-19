import { useState, useEffect } from 'react'
import { createRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { CreateSkill, Skill, SkillItem } from '@skillforge/core'
import { PencilIcon, StarIcon, Trash2Icon } from 'lucide-react'
import { rootRoute } from './__root'
import {
  useProject,
  useProjectSkills,
  useRenameProject,
  useUpdateProjectIcon,
  useRefreshProjectTools,
  useToggleFavoriteProject,
  useDeleteProject,
  useSaveSkillToLibrary,
} from '@/hooks/use-project-detail'
import { api, queryKeys } from '@/api/client'
import { ErrorContainer } from '@/components/ErrorContainer'
import { H1 } from '@/components/typography'
import { Button } from '@/components/ui/button'
import { ProjectAvatar } from '@/components/project-avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { RenameProjectDialog } from '@/components/project-detail/RenameProjectDialog'
import { ProjectIconForm } from '@/components/project-detail/ProjectIconForm'
import { DetectedToolsList } from '@/components/project-detail/DetectedToolsList'
import { ProjectSkillsSection } from '@/components/project-detail/ProjectSkillsSection'
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog'
import { cn } from '@/lib/utils'
import { useBreadcrumb } from '@/lib/breadcrumbs'

const toolMap: Record<string, Skill['originalTool']> = {
  'claude-code': 'claude',
  cursor: 'cursor',
  codex: 'openai',
  'gemini-cli': 'gemini',
  opencode: 'generic',
}

function skillItemToCreateSkill(skill: SkillItem, toolName: string): CreateSkill {
  return {
    name: skill.name,
    description: skill.description,
    body: skill.body,
    frontmatter: skill.frontmatter,
    implementationRef: skill.filePath,
    source: 'imported',
    originalTool: toolMap[toolName],
  }
}

export const projectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId',
  component: ProjectDetailPage,
})

function ProjectDetailPage() {
  const { projectId } = projectDetailRoute.useParams()
  const navigate = useNavigate()

  const { data: project, isLoading, error } = useProject(projectId)
  const { data: skillsByTool, isLoading: skillsLoading } = useProjectSkills(projectId)
  const { data: librarySkills = [] } = useQuery({
    queryKey: queryKeys.skills.lists(),
    queryFn: () => api.skills.list(),
  })
  const saveSkill = useSaveSkillToLibrary()
  useBreadcrumb(`/projects/${projectId}`, project?.name)
  const renameMutation = useRenameProject(projectId)
  const updateIconMutation = useUpdateProjectIcon(projectId)
  const refreshToolsMutation = useRefreshProjectTools(projectId)
  const favoriteMutation = useToggleFavoriteProject(projectId)
  const deleteMutation = useDeleteProject(projectId)

  const [renameOpen, setRenameOpen] = useState(false)
  const [renameDraft, setRenameDraft] = useState('')
  const [iconPath, setIconPath] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (project) {
      setIconPath(project.iconPath ?? '')
    }
  }, [project])

  function handleRename() {
    const trimmed = renameDraft.trim()
    if (!trimmed) return
    renameMutation.mutate({ name: trimmed }, { onSuccess: () => setRenameOpen(false) })
  }

  if (error) {
    return (
      <ErrorContainer
        title="Failed to load project"
        message={error.message}
        backTo="/projects"
        backLabel="Back to projects"
      />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
    )
  }

  if (!project) return null
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <ProjectAvatar project={project} size="lg" />
          <div className="flex items-center gap-4">
            <H1>{project.name}</H1>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                className={cn(
                  project.isFavorite && 'text-yellow-400 hover:text-yellow-400',
                  !project.isFavorite &&
                    'text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10 dark:hover:bg-yellow-400/20'
                )}
                onClick={() => favoriteMutation.mutate()}
              >
                <StarIcon
                  className={cn(
                    'size-4',
                    project.isFavorite && 'fill-yellow-400 group-hover/button:fill-yellow-400/50'
                  )}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setRenameDraft(project.name)
                  setRenameOpen(true)
                }}
              >
                <PencilIcon className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                className="hover:text-destructive text-muted-foreground hover:bg-destructive/10 dark:hover:bg-destructive/20"
                onClick={() => {
                  deleteMutation.reset()
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground font-mono text-sm ml-[52px]">{project.path}</p>
      </div>

      <RenameProjectDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        name={renameDraft}
        onNameChange={setRenameDraft}
        onSubmit={handleRename}
        isPending={renameMutation.isPending}
      />

      <ProjectIconForm
        iconPath={iconPath}
        projectPath={project.path}
        onIconPathChange={setIconPath}
        onApplyIcon={(value) => updateIconMutation.mutate({ iconPath: value })}
        isPending={updateIconMutation.isPending}
      />

      <DetectedToolsList
        tools={project.detectedTools.filter((t) => t.detected)}
        onRefresh={() => refreshToolsMutation.mutate()}
        isRefreshing={refreshToolsMutation.isPending}
      />

      {skillsLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      ) : skillsByTool ? (
        <ProjectSkillsSection
          detectedTools={project.detectedTools}
          skillsByTool={skillsByTool}
          librarySkills={librarySkills}
          onSave={(skill, toolName) => saveSkill.mutate(skillItemToCreateSkill(skill, toolName))}
          isSaving={saveSkill.isPending}
        />
      ) : null}

      <DeleteProjectDialog
        project={deleteDialogOpen ? project : null}
        onOpenChange={(open) => !open && setDeleteDialogOpen(false)}
        onConfirm={() => {
          deleteMutation.mutate(undefined, {
            onSuccess: () => {
              setDeleteDialogOpen(false)
              navigate({ to: '/projects' })
            },
          })
        }}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
