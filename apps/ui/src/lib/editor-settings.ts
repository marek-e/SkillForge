export const KNOWN_EDITORS = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'code', label: 'VS Code' },
  { value: 'zed', label: 'Zed' },
  { value: 'subl', label: 'Sublime Text' },
]

const STORAGE_KEY = 'skillforge:defaultEditor'

export function getDefaultEditor(): string {
  return localStorage.getItem(STORAGE_KEY) ?? 'auto'
}

export function setDefaultEditor(value: string): void {
  localStorage.setItem(STORAGE_KEY, value)
}
