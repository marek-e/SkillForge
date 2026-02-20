import { useState, useEffect } from 'react'
import { createRoute, useNavigate } from '@tanstack/react-router'
import type { CreateSkill, Skill, SkillItem } from '@skillforge/core'
import { PencilIcon, RefreshCwIcon, StarIcon, Trash2Icon } from 'lucide-react'
import { rootRoute } from './__root'
import {
  useProject,
  useProjectSkills,
  useRenameProject,
  useUpdateProjectIcon,
  useUpdateProjectEditor,
  useToggleFavoriteProject,
  useDeleteProject,
  useSaveSkillToLibrary,
} from '@/hooks/use-project-detail'
import { ErrorContainer } from '@/components/ErrorContainer'
import { H1 } from '@/components/typography'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ProjectAvatar } from '@/components/project-avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { RenameProjectDialog } from '@/components/project-detail/RenameProjectDialog'
import { ProjectOverviewCard } from '@/components/project-detail/ProjectOverviewCard'
import { ProjectSkillsSection } from '@/components/project-detail/ProjectSkillsSection'
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog'
import { cn } from '@/lib/utils'
import { useBreadcrumb } from '@/lib/breadcrumbs'
import { useSkills } from '@/hooks/use-skill-library'

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
    tags: [],
    scope: 'general',
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

  const { data: project, isPending, error } = useProject(projectId)
  const {
    data: skillsByTool,
    isFetching: skillsFetching,
    isPending: skillsPending,
    refetch: refetchSkills,
  } = useProjectSkills(projectId)
  const { data: librarySkills = [] } = useSkills()
  const saveSkill = useSaveSkillToLibrary()
  useBreadcrumb(`/projects/${projectId}`, project?.name)
  const renameMutation = useRenameProject(projectId)
  const updateIconMutation = useUpdateProjectIcon(projectId)
  const updateEditorMutation = useUpdateProjectEditor(projectId)
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

  if (isPending) {
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
                className="text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 dark:hover:bg-blue-500/25"
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
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground hover:text-green-500 hover:bg-green-500/10 dark:hover:bg-green-500/20"
                    onClick={() => refetchSkills()}
                    disabled={skillsFetching}
                  >
                    <RefreshCwIcon className={cn('size-4', skillsFetching && 'animate-spin')} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Refresh detected skills</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <RenameProjectDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        name={renameDraft}
        onNameChange={setRenameDraft}
        onSubmit={handleRename}
        isPending={renameMutation.isPending}
      />

      <ProjectOverviewCard
        project={project}
        iconPath={iconPath}
        onIconPathChange={setIconPath}
        onApplyIcon={(v) => updateIconMutation.mutate({ iconPath: v })}
        isIconPending={updateIconMutation.isPending}
        onEditorChange={(editor, customCmd) =>
          updateEditorMutation.mutate({
            preferredEditor: editor === 'auto' ? null : editor,
            customEditorCmd: editor === 'custom' ? customCmd || null : null,
          })
        }
      />

      {skillsPending ? (
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
