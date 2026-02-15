export interface ElectronAPI {
  isElectron: boolean
  platform: string
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  openFolderDialog: () => Promise<string | null>
}

export type ElectronWindow = Window & { electronAPI?: ElectronAPI }
