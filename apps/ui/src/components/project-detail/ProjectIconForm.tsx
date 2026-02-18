import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isElectron, type ElectronWindow } from '@/lib/electron'

interface ProjectIconFormProps {
  iconPath: string
  projectPath: string
  onIconPathChange: (value: string) => void
  onApplyIcon: (value: string | null) => void
  isPending: boolean
}

export function ProjectIconForm({
  iconPath,
  projectPath,
  onIconPathChange,
  onApplyIcon,
  isPending,
}: ProjectIconFormProps) {
  const [pickerError, setPickerError] = useState<string | null>(null)

  async function handleBrowse() {
    const result = await (window as ElectronWindow).electronAPI!.openFileDialog(projectPath)
    if (!result) return
    if ('error' in result) {
      setPickerError(result.error)
      return
    }
    setPickerError(null)
    onIconPathChange(result.dataUrl)
    onApplyIcon(result.dataUrl)
  }

  function handleRemove() {
    setPickerError(null)
    onIconPathChange('')
    onApplyIcon(null)
  }

  return (
    <div className="space-y-3">
      <Label>Icon</Label>
      <div className="flex items-center gap-4">
        <div
          className={`size-9 shrink-0 overflow-hidden flex items-center justify-center bg-muted border border-border/50 ${iconPath ? 'rounded-none' : 'rounded-lg'}`}
        >
          {iconPath ? (
            <img src={iconPath} alt="Project icon" className="size-full object-contain" />
          ) : (
            <ImageIcon className="size-4 text-muted-foreground" />
          )}
        </div>

        {isElectron ? (
          <>
            <span className="text-sm text-muted-foreground">
              {iconPath ? 'Custom image' : 'No icon'}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleBrowse} disabled={isPending}>
                {isPending ? 'Saving…' : 'Change'}
              </Button>
              {iconPath && (
                <Button variant="destructive" size="sm" onClick={handleRemove} disabled={isPending}>
                  Remove
                </Button>
              )}
            </div>
          </>
        ) : (
          <Input
            value={iconPath}
            onChange={(e) => onIconPathChange(e.target.value)}
            onBlur={(e) => onApplyIcon(e.target.value.trim() || null)}
            placeholder="https://example.com/logo.svg"
            disabled={isPending}
            className="flex-1"
          />
        )}
      </div>

      {pickerError && <p className="text-destructive text-sm">{pickerError}</p>}
    </div>
  )
}
