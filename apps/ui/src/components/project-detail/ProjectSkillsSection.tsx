import type { DetectedTool, Skill, SkillItem } from '@skillforge/core'
import { BookmarkPlusIcon, CheckIcon, WrenchIcon } from 'lucide-react'
import { getToolConfig } from '@/lib/tool-config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface SkillRow {
  skill: SkillItem
  toolName: string
}

interface ProjectSkillsSectionProps {
  detectedTools: DetectedTool[]
  skillsByTool: Record<string, SkillItem[]>
  librarySkills: Skill[]
  onSave: (skill: SkillItem, toolName: string) => void
  isSaving: boolean
}

export function ProjectSkillsSection({
  detectedTools,
  skillsByTool,
  librarySkills,
  onSave,
  isSaving,
}: ProjectSkillsSectionProps) {
  const detected = detectedTools.filter((t) => t.detected)
  if (detected.length === 0) return null

  const rows: SkillRow[] = detected.flatMap((tool) =>
    (skillsByTool[tool.name] ?? []).map((skill) => ({ skill, toolName: tool.name }))
  )

  const savedPaths = new Set(librarySkills.map((s) => s.implementationRef))
  const unsavedRows = rows.filter(({ skill }) => !savedPaths.has(skill.filePath))

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>Skills</Label>
        {rows.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {rows.length}
          </Badge>
        )}
        {unsavedRows.length > 0 && (
          <Button
            variant="outline"
            size="xs"
            className="ml-auto"
            disabled={isSaving}
            onClick={() => {
              for (const { skill, toolName } of unsavedRows) {
                onSave(skill, toolName)
              }
            }}
          >
            <BookmarkPlusIcon className="size-3" />
            Save all
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No skills found in this project</p>
      ) : (
        <div className="divide-y divide-border">
          {rows.map(({ skill, toolName }) => {
            const config = getToolConfig(toolName)
            const isSaved = savedPaths.has(skill.filePath)
            return (
              <div key={`${toolName}:${skill.name}`} className="flex items-start gap-3 py-2.5">
                <WrenchIcon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{skill.name}</span>
                    <Badge variant="outline" className="text-xs gap-1 px-1.5 py-0">
                      <img
                        src={config.logo}
                        alt={config.displayName}
                        className={`size-3 ${config.invert ? 'dark:invert' : ''}`}
                      />
                      {config.displayName}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{skill.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={isSaved || isSaving}
                  onClick={() => onSave(skill, toolName)}
                  title={isSaved ? 'Already in library' : 'Save to library'}
                >
                  {isSaved ? (
                    <CheckIcon className="size-4 text-green-500" />
                  ) : (
                    <BookmarkPlusIcon className="size-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
