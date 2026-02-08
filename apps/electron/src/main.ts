import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import path from 'node:path'
import { startRuntime, stopRuntime } from './runtime-bridge'

const PORT = 4321
let mainWindow: BrowserWindow | null = null

function createWindow(url: string) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 12 },
    titleBarOverlay: {
      color: '#00000000',
      symbolColor: '#a1a1aa',
      height: 36,
    },
    icon: path.join(__dirname, '../icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.loadURL(url)

  // Open external links in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://localhost')) {
      return { action: 'allow' }
    }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

async function bootstrap() {
  const isDev = !app.isPackaged

  if (isDev) {
    // Dev mode: runtime with CORS for Vite dev server, load UI from Vite
    await startRuntime({
      port: PORT,
      corsOrigins: ['http://localhost:4320'],
    })

    createWindow('http://localhost:4320')
    mainWindow?.webContents.openDevTools()
  } else {
    // Production: runtime serves static UI, single origin
    const uiPath = path.join(process.resourcesPath, 'ui')

    await startRuntime({
      port: PORT,
      staticDir: uiPath,
    })

    createWindow(`http://localhost:${PORT}`)
  }
}

ipcMain.handle('window:minimize', () => mainWindow?.minimize())
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.handle('window:close', () => mainWindow?.close())

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
  if (mainWindow === null) {
    const url = app.isPackaged ? `http://localhost:${PORT}` : 'http://localhost:4320'
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
})
