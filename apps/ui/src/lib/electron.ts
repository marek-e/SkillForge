export interface ElectronAPI {
  isElectron: boolean
  platform: string
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
}

export type ElectronWindow = Window & { electronAPI?: ElectronAPI }
