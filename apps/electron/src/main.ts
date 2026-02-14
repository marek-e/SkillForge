import { app, dialog, ipcMain } from 'electron'
import path from 'node:path'
import type { RuntimeEndpointInfo } from './runtime-bridge'
import { startRuntime, stopRuntime } from './runtime-bridge'
import { createWindow, getMainWindow, getMigrationsFolder } from './window'
import { registerProtocolHandler, registerScheme } from './protocol'

const PORT = 4321
let runtimeEndpoint: RuntimeEndpointInfo | null = null

// Must run before app.ready
registerScheme()

async function bootstrap() {
  const isDev = !app.isPackaged

  if (isDev) {
    runtimeEndpoint = await startRuntime({
      port: PORT,
      migrationsFolder: getMigrationsFolder(),
      corsOrigins: ['http://localhost:4320'],
    })
    createWindow('http://localhost:4320')
    getMainWindow()?.webContents.openDevTools()
    return
  }

  // Packaged: start runtime (IPC or TCP fallback), then handle skillforge://
  const uiPath = path.join(process.resourcesPath, 'ui')
  runtimeEndpoint = await startRuntime({
    port: 0,
    migrationsFolder: getMigrationsFolder(),
    staticDir: uiPath,
    useIpc: true,
    userDataPath: app.getPath('userData'),
  })

  registerProtocolHandler(() => runtimeEndpoint)
  createWindow('skillforge://app/')
}

ipcMain.handle('window:minimize', () => getMainWindow()?.minimize())
ipcMain.handle('window:maximize', () => {
  const win = getMainWindow()
  if (win?.isMaximized()) {
    win.unmaximize()
  } else {
    win?.maximize()
  }
})
ipcMain.handle('window:close', () => getMainWindow()?.close())

app
  .whenReady()
  .then(bootstrap)
  .catch(async (err) => {
    console.error('Failed to start SkillForge:', err)
    await dialog.showMessageBox({
      type: 'error',
      title: 'SkillForge',
      message: 'Failed to start SkillForge',
      detail: err instanceof Error ? err.message : String(err),
    })
    app.quit()
  })

// macOS: re-create window when dock icon is clicked
app.on('activate', () => {
  if (getMainWindow() === null) {
    const url = app.isPackaged ? 'skillforge://app/' : 'http://localhost:4320'
    createWindow(url)
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  await stopRuntime()
  runtimeEndpoint = null
})
