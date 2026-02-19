export interface ElectronAPI {
  isElectron: boolean
  platform: string
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  openFolderDialog: () => Promise<string | null>
  openFileDialog: (projectPath: string) => Promise<null | { error: string } | { dataUrl: string }>
  revealInFinder: (folderPath: string) => Promise<void>
  openInEditor: (folderPath: string) => Promise<string>
}

export type ElectronWindow = Window & { electronAPI?: ElectronAPI }

export const isElectron =
  typeof window !== 'undefined' && !!(window as ElectronWindow).electronAPI?.isElectron

export function getElectronAPI(): ElectronAPI | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as ElectronWindow).electronAPI
}
