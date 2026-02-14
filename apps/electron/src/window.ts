import { app, BrowserWindow, shell } from 'electron'
import path from 'node:path'

let mainWindow: BrowserWindow | null = null

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

export function getMigrationsFolder(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'drizzle')
  }
  return path.join(__dirname, '../../runtime/drizzle')
}

export function createWindow(url: string) {
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
    if (url.startsWith('http://localhost') || url.startsWith('skillforge://')) {
      return { action: 'allow' }
    }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}
