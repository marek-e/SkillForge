import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),
  openFileDialog: (projectPath: string) => ipcRenderer.invoke('dialog:openFile', projectPath),
  revealInFinder: (folderPath: string) => ipcRenderer.invoke('shell:revealInFinder', folderPath),
  openInEditor: (folderPath: string, editor?: string) =>
    ipcRenderer.invoke('shell:openInEditor', folderPath, editor),
})
