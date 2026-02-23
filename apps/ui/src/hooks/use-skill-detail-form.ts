import { useState, useRef } from 'react'
import type { Skill, SkillScope } from '@skillforge/core'
import { toast } from '@/components/ui/toaster'
import { api } from '@/api/client'
import { useUpdateSkill, useUpdateSkillContent } from '@/hooks/use-skill-detail'

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

export function useSkillDetailForm(skill: Skill, skillId: string) {
  const [nameDraft, setNameDraft] = useState(skill.name)
  const [descriptionDraft, setDescriptionDraft] = useState(skill.description)
  const [bodyDraft, setBodyDraft] = useState(skill.body ?? '')
  const [scopeDraft, setScopeDraft] = useState<SkillScope>(skill.scope)
  const [tagsDraft, setTagsDraft] = useState<string[]>(skill.tags)
  const [fileDrafts, setFileDrafts] = useState<Record<string, string>>({})
  const [isFileSaving, setIsFileSaving] = useState(false)

  // Tracks the original fetched content per file — shared with SkillDetailResourceFiles
  // so it can populate entries, while handleSave reads them for change detection.
  const loadedFileContentsRef = useRef<Record<string, string>>({})

  const updateMeta = useUpdateSkill(skillId)
  const updateContent = useUpdateSkillContent(skillId)

  const originalBody = skill.body ?? ''

  const hasChanges =
    nameDraft !== skill.name ||
    descriptionDraft !== skill.description ||
    bodyDraft !== originalBody ||
    scopeDraft !== skill.scope ||
    tagsDraft.length !== skill.tags.length ||
    tagsDraft.some((t, i) => t !== skill.tags[i]) ||
    Object.entries(fileDrafts).some(
      ([filePath, draft]) =>
        loadedFileContentsRef.current[filePath] !== undefined &&
        draft !== loadedFileContentsRef.current[filePath]
    )

  const isSaving = updateMeta.isPending || updateContent.isPending || isFileSaving

  async function handleSave() {
    const tasks: Promise<unknown>[] = []

    const metaUpdates: Partial<Pick<Skill, 'name' | 'description' | 'body' | 'tags' | 'scope'>> = {}
    if (nameDraft !== skill.name) metaUpdates.name = nameDraft
    if (descriptionDraft !== skill.description) metaUpdates.description = descriptionDraft
    if (bodyDraft !== originalBody) metaUpdates.body = bodyDraft
    if (scopeDraft !== skill.scope) metaUpdates.scope = scopeDraft
    const tagsChanged =
      tagsDraft.length !== skill.tags.length || tagsDraft.some((t, i) => t !== skill.tags[i])
    if (tagsChanged) metaUpdates.tags = tagsDraft
    if (Object.keys(metaUpdates).length > 0) {
      tasks.push(updateMeta.mutateAsync(metaUpdates))
    }

    if (bodyDraft !== originalBody && skill.implementationRef) {
      tasks.push(updateContent.mutateAsync(buildSkillMdContent(skill, bodyDraft)))
    }

    const fileUpdates = Object.entries(fileDrafts).filter(
      ([filePath, draft]) =>
        loadedFileContentsRef.current[filePath] !== undefined &&
        draft !== loadedFileContentsRef.current[filePath]
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

  return {
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
  }
}
