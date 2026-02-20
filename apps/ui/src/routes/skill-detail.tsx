import { useState, useEffect } from 'react'
import { createRoute, useNavigate } from '@tanstack/react-router'
import type { Skill, SkillScope } from '@skillforge/core'
import { ArrowLeftIcon, FileIcon, FileTextIcon, Trash2Icon, XIcon } from 'lucide-react'
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
import { toast } from '@/components/ui/toaster'
import { api } from '@/api/client'
import { DeleteSkillDialog } from '@/components/skills/DeleteSkillDialog'
import { getToolConfig } from '@/lib/tool-config'
import { useBreadcrumb } from '@/lib/breadcrumbs'
import {
  useSkill,
  useSkillDirectory,
  useSkillFile,
  useUpdateSkill,
  useUpdateSkillContent,
  useDeleteSkill,
} from '@/hooks/use-skill-detail'

const originalToolToName: Record<NonNullable<Skill['originalTool']>, string> = {
  claude: 'claude-code',
  cursor: 'cursor',
  openai: 'codex',
  gemini: 'gemini-cli',
  generic: 'opencode',
}

function dirnamePath(filePath: string): string {
  const idx = filePath.lastIndexOf('/')
  return idx >= 0 ? filePath.slice(0, idx) : filePath
}

function buildSkillMdContent(skill: Skill, body: string): string {
  const lines = ['---', `name: ${skill.name}`, `description: ${skill.description}`]
  if (skill.frontmatter) {
    for (const [key, value] of Object.entries(skill.frontmatter)) {
      lines.push(`${key}: ${value}`)
    }
  }
  lines.push('---')
  if (body) lines.push(body)
  return lines.join('\n')
}

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'md') return FileTextIcon
  return FileIcon
}

export const skillDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/skill-library/$skillId',
  component: SkillDetailPage,
})

function SkillDetailPage() {
  const { skillId } = skillDetailRoute.useParams()
  const navigate = useNavigate()

  const { data: skill, isLoading: skillLoading } = useSkill(skillId)
  const { data: directoryData } = useSkillDirectory(skillId, skill?.implementationRef)

  useBreadcrumb(`/skill-library/${skillId}`, skill?.name)

  const [nameDraft, setNameDraft] = useState('')
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [bodyDraft, setBodyDraft] = useState('')
  const [scopeDraft, setScopeDraft] = useState<SkillScope>('general')
  const [tagsDraft, setTagsDraft] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [fileDrafts, setFileDrafts] = useState<Record<string, string>>({})
  const [loadedFileContents, setLoadedFileContents] = useState<Record<string, string>>({})
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isFileSaving, setIsFileSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (skill) {
      setNameDraft(skill.name)
      setDescriptionDraft(skill.description)
      setBodyDraft(skill.body ?? '')
      setScopeDraft(skill.scope)
      setTagsDraft(skill.tags)
    }
  }, [skill])

  const { data: selectedFileData } = useSkillFile(skillId, selectedFile)

  useEffect(() => {
    if (selectedFile && selectedFileData) {
      setLoadedFileContents((prev) => ({ ...prev, [selectedFile]: selectedFileData.content }))
      setFileDrafts((prev) => {
        if (prev[selectedFile] === undefined) {
          return { ...prev, [selectedFile]: selectedFileData.content }
        }
        return prev
      })
    }
  }, [selectedFile, selectedFileData])

  const updateMeta = useUpdateSkill(skillId)
  const updateContent = useUpdateSkillContent(skillId)
  const deleteMutation = useDeleteSkill(skillId)

  async function handleSave() {
    if (!skill) return
    const tasks: Promise<unknown>[] = []

    const metaUpdates: Partial<Pick<Skill, 'name' | 'description' | 'body' | 'tags' | 'scope'>> = {}
    if (nameDraft !== skill.name) metaUpdates.name = nameDraft
    if (descriptionDraft !== skill.description) metaUpdates.description = descriptionDraft
    const originalBody = skill.body ?? ''
    if (bodyDraft !== originalBody) {
      metaUpdates.body = bodyDraft
    }
    if (scopeDraft !== skill.scope) metaUpdates.scope = scopeDraft
    const tagsChanged =
      tagsDraft.length !== skill.tags.length || tagsDraft.some((t, i) => t !== skill.tags[i])
    if (tagsChanged) metaUpdates.tags = tagsDraft
    if (Object.keys(metaUpdates).length > 0) {
      tasks.push(updateMeta.mutateAsync(metaUpdates))
    }

    if (bodyDraft !== (skill.body ?? '') && skill.implementationRef) {
      tasks.push(updateContent.mutateAsync(buildSkillMdContent(skill, bodyDraft)))
    }

    const fileUpdates = Object.entries(fileDrafts).filter(
      ([filePath, draft]) =>
        loadedFileContents[filePath] !== undefined && draft !== loadedFileContents[filePath]
    )
    if (fileUpdates.length > 0) {
      setIsFileSaving(true)
      for (const [filePath, draft] of fileUpdates) {
        tasks.push(api.skills.updateFile(skillId, filePath, draft))
      }
    }

    if (tasks.length === 0) return

    try {
      await Promise.all(tasks)
      toast.success({ title: 'Skill saved' })
    } catch {
      toast.error({ title: 'Failed to save skill' })
    } finally {
      setIsFileSaving(false)
    }
  }

  const isSaving = updateMeta.isPending || updateContent.isPending || isFileSaving

  const originalBody = skill?.body ?? ''
  const hasChanges =
    !!skill &&
    (nameDraft !== skill.name ||
      descriptionDraft !== skill.description ||
      bodyDraft !== originalBody ||
      scopeDraft !== skill.scope ||
      tagsDraft.length !== skill.tags.length ||
      tagsDraft.some((t, i) => t !== skill.tags[i]) ||
      Object.entries(fileDrafts).some(
        ([filePath, draft]) =>
          loadedFileContents[filePath] !== undefined && draft !== loadedFileContents[filePath]
      ))

  const resourceFiles = directoryData?.files.filter((f) => f !== 'SKILL.md') ?? []

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

  const toolName = skill.originalTool ? originalToolToName[skill.originalTool] : undefined
  const config = toolName ? getToolConfig(toolName) : undefined
  const skillDir = skill.implementationRef ? dirnamePath(skill.implementationRef) : undefined

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
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border px-2 py-1.5 min-h-8">
            {tagsDraft.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 text-xs font-mono">
                {tag.startsWith('#') ? tag : `#${tag}`}
                <button
                  type="button"
                  onClick={() => setTagsDraft((prev) => prev.filter((t) => t !== tag))}
                  className="hover:text-foreground"
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  const value = tagInput.trim().replace(/^#/, '')
                  if (value && !tagsDraft.includes(value)) {
                    setTagsDraft((prev) => [...prev, value])
                  }
                  setTagInput('')
                }
                if (e.key === 'Backspace' && !tagInput && tagsDraft.length > 0) {
                  setTagsDraft((prev) => prev.slice(0, -1))
                }
              }}
              placeholder={tagsDraft.length === 0 ? 'Add tags…' : ''}
              className="flex-1 min-w-16 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
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
        <div className="space-y-2">
          <Label>Resource files</Label>
          <div className="border rounded-md divide-y">
            {resourceFiles.map((file) => {
              const Icon = getFileIcon(file)
              const isSelected = selectedFile === file
              return (
                <div key={file}>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(isSelected ? null : file)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors ${isSelected ? 'bg-muted/50' : ''}`}
                  >
                    <Icon className="size-4 text-muted-foreground shrink-0" />
                    <span className="font-mono text-xs">{file}</span>
                  </button>
                  {isSelected && (
                    <div className="px-3 pb-3">
                      <Textarea
                        value={fileDrafts[file] ?? loadedFileContents[file] ?? ''}
                        onChange={(e) =>
                          setFileDrafts((prev) => ({ ...prev, [file]: e.target.value }))
                        }
                        className="font-mono text-xs min-h-48"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
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
