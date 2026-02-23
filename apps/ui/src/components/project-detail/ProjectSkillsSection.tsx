import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { DetectedTool, Skill, SkillItem } from '@skillforge/core'
import {
  BookmarkCheck,
  BookmarkPlusIcon,
  CheckIcon,
  ClipboardCopyIcon,
  ExternalLinkIcon,
  LayoutGridIcon,
  LayoutListIcon,
  WrenchIcon,
} from 'lucide-react'
import { getToolConfig } from '@/lib/tool-config'
import { getElectronAPI, isElectron } from '@/lib/electron'
import { getCustomEditorCmd, getDefaultEditor } from '@/lib/editor-settings'
import { getDefaultSkillView, setDefaultSkillView, type SkillViewMode } from '@/lib/skill-view'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface SkillRow {
  skill: SkillItem
  toolName: string
}

interface ProjectSkillsSectionProps {
  detectedTools: DetectedTool[]
  skillsByTool: Record<string, SkillItem[]>
  librarySkills: Skill[]
  preferredEditor?: string | null
  customEditorCmd?: string | null
  onSave: (skill: SkillItem, toolName: string) => void
  isSaving: boolean
}

function isSingleFile(skill: SkillItem): boolean {
  return typeof skill.body === 'string' && skill.body.trim().length > 0
}

function getSkillDir(filePath: string): string {
  const idx = filePath.lastIndexOf('/')
  return idx === -1 ? filePath : filePath.substring(0, idx)
}

export function ProjectSkillsSection({
  detectedTools,
  skillsByTool,
  librarySkills,
  preferredEditor,
  customEditorCmd,
  onSave,
  isSaving,
}: ProjectSkillsSectionProps) {
  const [copiedPath, setCopiedPath] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<SkillViewMode>(() => getDefaultSkillView())

  function handleViewModeChange(mode: SkillViewMode) {
    setViewMode(mode)
    setDefaultSkillView(mode)
  }

  const detected = detectedTools.filter((t) => t.detected)
  if (detected.length === 0) return null

  const rows: SkillRow[] = detected.flatMap((tool) =>
    (skillsByTool[tool.name] ?? []).map((skill) => ({ skill, toolName: tool.name }))
  )

  const savedSkillIdsByRef = new Map(
    librarySkills.filter((s) => s.implementationRef).map((s) => [s.implementationRef, s.id])
  )
  const unsavedRows = rows.filter(({ skill }) => !savedSkillIdsByRef.has(skill.filePath))

  function handleCopy(skill: SkillItem) {
    if (!skill.body) return
    void navigator.clipboard.writeText(skill.body)
    setCopiedPath(skill.filePath)
    setTimeout(() => setCopiedPath(null), 1500)
  }

  function handleOpenInEditor(skill: SkillItem) {
    const api = getElectronAPI()
    if (!api) return
    const single = isSingleFile(skill)
    const path = single ? skill.filePath : getSkillDir(skill.filePath)
    const effectiveEditor = preferredEditor ?? getDefaultEditor()
    const cmd =
      effectiveEditor === 'custom' ? (customEditorCmd ?? getCustomEditorCmd()) : effectiveEditor
    void api.openInEditor(path, cmd === 'auto' ? undefined : cmd)
  }

  function renderSkillActions(skill: SkillItem, toolName: string) {
    const savedId = savedSkillIdsByRef.get(skill.filePath)
    const isSaved = savedId !== undefined
    const single = isSingleFile(skill)
    const isCopied = copiedPath === skill.filePath

    return (
      <div className="flex items-center gap-0.5 shrink-0">
        {single && (
          <Tooltip delayDuration={700}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-xs" onClick={() => handleCopy(skill)}>
                {isCopied ? (
                  <CheckIcon className="size-3.5 text-green-500" />
                ) : (
                  <ClipboardCopyIcon className="size-3.5 text-muted-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isCopied ? 'Copied!' : 'Copy content'}</TooltipContent>
          </Tooltip>
        )}

        {isElectron && (
          <Tooltip delayDuration={700}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleOpenInEditor(skill)}
              >
                <ExternalLinkIcon className="size-3.5 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {single ? 'Open file in editor' : 'Open folder in editor'}
            </TooltipContent>
          </Tooltip>
        )}

        {isSaved ? (
          <Tooltip delayDuration={700}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-xs" asChild>
                <Link to="/skill-library/$skillId" params={{ skillId: savedId }}>
                  <BookmarkCheck className="size-3.5 text-green-500" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>View in library</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip delayDuration={700}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                disabled={isSaving}
                onClick={() => onSave(skill, toolName)}
              >
                <BookmarkPlusIcon className="size-3.5 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save to library</TooltipContent>
          </Tooltip>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>Skills</Label>
        {rows.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {rows.length}
          </Badge>
        )}
        <div className="ml-auto flex items-center gap-2">
          {unsavedRows.length > 0 && (
            <Button
              variant="outline"
              size="xs"
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
          <ButtonGroup>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'outline'}
              size="icon-xs"
              onClick={() => handleViewModeChange('list')}
              aria-label="List view"
            >
              <LayoutListIcon className="size-3.5" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'outline'}
              size="icon-xs"
              onClick={() => handleViewModeChange('grid')}
              aria-label="Grid view"
            >
              <LayoutGridIcon className="size-3.5" />
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No skills found in this project</p>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ skill, toolName }) => {
            const config = getToolConfig(toolName)
            return (
              <Card key={`${toolName}:${skill.name}`} size="sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <WrenchIcon className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{skill.name}</span>
                  </CardTitle>
                  <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                    {renderSkillActions(skill, toolName)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{skill.description}</p>
                  <Badge variant="outline" className="text-xs gap-1 px-1.5 py-0">
                    <img
                      src={config.logo}
                      alt={config.displayName}
                      className={`size-3 ${config.invert ? 'dark:invert' : ''}`}
                    />
                    {config.displayName}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {rows.map(({ skill, toolName }) => {
            const config = getToolConfig(toolName)

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

                {renderSkillActions(skill, toolName)}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
