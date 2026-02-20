export const KNOWN_EDITORS = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'code', label: 'VS Code' },
  { value: 'zed', label: 'Zed' },
  { value: 'subl', label: 'Sublime Text' },
  { value: 'custom', label: 'Custom…' },
]

const EDITOR_KEY = 'skillforge:defaultEditor'
const CUSTOM_CMD_KEY = 'skillforge:customEditorCmd'

export function getDefaultEditor(): string {
  return localStorage.getItem(EDITOR_KEY) ?? 'auto'
}

export function setDefaultEditor(value: string): void {
  localStorage.setItem(EDITOR_KEY, value)
}

export function getCustomEditorCmd(): string {
  return localStorage.getItem(CUSTOM_CMD_KEY) ?? ''
}

export function setCustomEditorCmd(value: string): void {
  localStorage.setItem(CUSTOM_CMD_KEY, value)
}
