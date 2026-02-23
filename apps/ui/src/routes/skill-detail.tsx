import { createRoute, useNavigate } from '@tanstack/react-router'
import type { Skill, SkillScope } from '@skillforge/core'
import { ArrowLeftIcon, Trash2Icon } from 'lucide-react'
import { rootRoute } from './__root'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DeleteSkillDialog } from '@/components/skills/DeleteSkillDialog'
import { SkillDetailResourceFiles } from '@/components/skills/SkillDetailResourceFiles'
import { TagsInput } from '@/components/skills/TagsInput'
import { getToolConfig, originalToolToName } from '@/lib/tool-config'
import { useBreadcrumb } from '@/lib/breadcrumbs'
import { useSkill, useSkillDirectory, useDeleteSkill } from '@/hooks/use-skill-detail'
import { useAvailableTags } from '@/hooks/use-skill-library'
import { useSkillDetailForm } from '@/hooks/use-skill-detail-form'
import { useState } from 'react'

function dirnamePath(filePath: string): string {
  const idx = filePath.lastIndexOf('/')
  return idx >= 0 ? filePath.slice(0, idx) : filePath
}

export const skillDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/skill-library/$skillId',
  component: SkillDetailPage,
})

function SkillDetailPage() {
  const { skillId } = skillDetailRoute.useParams()
  const { data: skill, isLoading: skillLoading } = useSkill(skillId)

  useBreadcrumb(`/skill-library/${skillId}`, skill?.name)

  if (skillLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!skill) return null

  return <SkillDetailForm skill={skill} skillId={skillId} />
}

function SkillDetailForm({ skill, skillId }: { skill: Skill; skillId: string }) {
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { data: directoryData } = useSkillDirectory(skillId, skill.implementationRef)
  const deleteMutation = useDeleteSkill(skillId)
  const availableTags = useAvailableTags()

  const {
    nameDraft,
    setNameDraft,
    descriptionDraft,
    setDescriptionDraft,
    bodyDraft,
    setBodyDraft,
    scopeDraft,
    setScopeDraft,
    tagsDraft,
    setTagsDraft,
    fileDrafts,
    setFileDrafts,
    loadedFileContentsRef,
    hasChanges,
    isSaving,
    handleSave,
  } = useSkillDetailForm(skill, skillId)

  const toolName = skill.originalTool ? originalToolToName[skill.originalTool] : undefined
  const config = toolName ? getToolConfig(toolName) : undefined
  const skillDir = skill.implementationRef ? dirnamePath(skill.implementationRef) : undefined
  const resourceFiles = directoryData?.files.filter((f) => f !== 'SKILL.md') ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground"
          onClick={() => navigate({ to: '/skill-library' })}
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <Input
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          className="text-2xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0"
          placeholder="Skill name"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {config && (
          <Badge variant="outline" className="gap-1 px-1.5 py-0">
            <img
              src={config.logo}
              alt={config.displayName}
              className={`size-3 ${config.invert ? 'dark:invert' : ''}`}
            />
            {config.displayName}
          </Badge>
        )}
        <Badge variant="secondary">{skill.source}</Badge>
        <span className="text-xs text-muted-foreground">
          Added {new Date(skill.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={descriptionDraft}
          onChange={(e) => setDescriptionDraft(e.target.value)}
          placeholder="Skill description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Scope</Label>
          <Select value={scopeDraft} onValueChange={(v) => setScopeDraft(v as SkillScope)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="project-specific">Project-specific</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <TagsInput value={tagsDraft} onChange={setTagsDraft} suggestions={availableTags} />
        </div>
      </div>

      {skillDir && (
        <div className="space-y-2">
          <Label>Skill directory</Label>
          <p className="text-xs text-muted-foreground font-mono">{skillDir}</p>
        </div>
      )}

      {skill.implementationRef && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Instructions</Label>
            <Badge variant="outline" className="text-xs px-1.5 py-0 font-mono">
              SKILL.md
            </Badge>
          </div>
          <Textarea
            value={bodyDraft}
            onChange={(e) => setBodyDraft(e.target.value)}
            className="font-mono text-xs min-h-64"
            placeholder="Skill instructions…"
          />
        </div>
      )}

      {!skill.implementationRef && (
        <p className="text-sm text-muted-foreground">No file associated with this skill.</p>
      )}

      {resourceFiles.length > 0 && (
        <SkillDetailResourceFiles
          skillId={skillId}
          files={resourceFiles}
          fileDrafts={fileDrafts}
          loadedFileContentsRef={loadedFileContentsRef}
          onFileDraftChange={(file, content) =>
            setFileDrafts((prev) => ({ ...prev, [file]: content }))
          }
        />
      )}

      <DeleteSkillDialog
        skill={deleteDialogOpen ? skill : null}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => deleteMutation.mutate()}
        isPending={deleteMutation.isPending}
      />

      <div className="flex items-center justify-between">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={deleteMutation.isPending}
        >
          <Trash2Icon className="size-4" />
          Remove from library
        </Button>
        <Button size="sm" onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}
