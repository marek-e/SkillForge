import { useState } from 'react'
import { FileIcon, FileTextIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSkillFile } from '@/hooks/use-skill-detail'

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'md') return FileTextIcon
  return FileIcon
}

interface SkillDetailResourceFilesProps {
  skillId: string
  files: string[]
  fileDrafts: Record<string, string>
  loadedFileContentsRef: { current: Record<string, string> }
  onFileDraftChange: (file: string, content: string) => void
}

export function SkillDetailResourceFiles({
  skillId,
  files,
  fileDrafts,
  loadedFileContentsRef,
  onFileDraftChange,
}: SkillDetailResourceFilesProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const { data: selectedFileData } = useSkillFile(skillId, selectedFile)

  // Cache original content for change detection in the parent form hook
  if (
    selectedFile &&
    selectedFileData?.content !== undefined &&
    !(selectedFile in loadedFileContentsRef.current)
  ) {
    loadedFileContentsRef.current[selectedFile] = selectedFileData.content
  }

  return (
    <div className="space-y-2">
      <Label>Resource files</Label>
      <div className="border rounded-md divide-y">
        {files.map((file) => {
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
                    value={fileDrafts[file] ?? selectedFileData?.content ?? ''}
                    onChange={(e) => onFileDraftChange(file, e.target.value)}
                    className="font-mono text-xs min-h-48"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
