import * as stylex from '@stylexjs/stylex'
import { colors } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { KNOWN_EDITORS } from '@/lib/editor-settings'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import { SquareTerminal } from 'lucide-react'

const styles = stylex.create({
  layout: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  customGroup: { maxWidth: '20rem' },
  input: { fontSize: '0.875rem', lineHeight: '1.25rem' },
  trigger: { fontSize: '0.875rem', lineHeight: '1.25rem' },
  icon: { width: '1rem', height: '1rem', color: colors.foreground },
})

interface EditorSelectProps {
  /** The stored editor value: 'auto' | 'cursor' | 'code' | 'zed' | 'subl' | 'custom' | null */
  value: string | null
  /** The stored custom command text (only used when value === 'custom') */
  customCmd: string
  /** Called when either the editor or the custom command changes */
  onChange: (editor: string, customCmd: string) => void
  /** Layout of the dropdown + custom input.
   *  - 'inline': side-by-side (card row)
   *  - 'stacked': input below the dropdown (settings page)
   */
  layout?: 'inline' | 'stacked'
  /** Extra className for the SelectTrigger width. */
  triggerClassName?: string
  triggerSx?: Sx
  /** Extra className for the custom Input width. */
  inputClassName?: string
  inputSx?: Sx
}

export function EditorSelect({
  value,
  customCmd,
  onChange,
  triggerClassName,
  inputClassName,
  triggerSx,
  inputSx,
}: EditorSelectProps) {
  const selectValue = value ?? 'auto'

  // Local draft for the custom command — only lives while the input is mounted.
  // Initialized from the prop; written back to the parent on blur.
  const [localCmd, setLocalCmd] = useState(customCmd)

  const customInput = selectValue === 'custom' && (
    <Tooltip delayDuration={400}>
      <TooltipTrigger asChild>
        <InputGroup sx={styles.customGroup}>
          <InputGroupInput
            placeholder="e.g. windsurf"
            value={localCmd}
            onChange={(e) => setLocalCmd(e.target.value)}
            onBlur={() => onChange('custom', localCmd.trim())}
            className={inputClassName}
            sx={[styles.input, inputSx]}
            autoFocus
          />
          <InputGroupAddon>
            <SquareTerminal
              className={[stylex.props(styles.icon).className, 'size-explicit'].join(' ')}
            />
          </InputGroupAddon>
        </InputGroup>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>Enter the command to open the editor. e.g. "windsurf" for Windsurf.</p>
      </TooltipContent>
    </Tooltip>
  )

  const select = (
    <Select
      value={selectValue}
      onValueChange={(v) => {
        if (v !== 'custom') {
          onChange(v, '')
        } else {
          onChange('custom', localCmd.trim())
        }
      }}
    >
      <SelectTrigger className={triggerClassName} sx={[styles.trigger, triggerSx]}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {KNOWN_EDITORS.map((e) => (
          <SelectItem key={e.value} value={e.value}>
            {e.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <div {...stylex.props(styles.layout)}>
      {select}
      {customInput}
    </div>
  )
}
