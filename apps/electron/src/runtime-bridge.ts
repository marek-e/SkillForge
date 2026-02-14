import fs from 'node:fs'
import type { ServerType } from '@hono/node-server'
import { createApp } from '@skillforge/runtime/app'
import { closeDb, initDb } from '@skillforge/runtime/db'
import { serveStatic } from '@hono/node-server/serve-static'
import { isPortInUse, startTcpServer } from './servers/tcp'
import { getIpcPath, startIpcServer } from './servers/ipc'

let server: ServerType | null = null
let ipcPath: string | null = null

function setServer(s: ServerType) {
  server = s
}

function setIpcPath(p: string | null) {
  ipcPath = p
}

export interface RuntimeEndpointInfo {
  transport: 'tcp' | 'ipc'
  baseUrl: string
  port?: number
  ipcPath?: string
}

export interface StartRuntimeOptions {
  port: number
  migrationsFolder: string
  corsOrigins?: string[]
  staticDir?: string
  /** When true, try IPC first (packaged mode); requires userDataPath. */
  useIpc?: boolean
  userDataPath?: string
}

export async function startRuntime(options: StartRuntimeOptions): Promise<RuntimeEndpointInfo> {
  const { port, migrationsFolder, corsOrigins, staticDir, useIpc, userDataPath } = options

  if (!useIpc || !userDataPath) {
    if (await isPortInUse(port)) {
      console.log(`SkillForge Runtime already running on http://localhost:${port}, reusing`)
      return { transport: 'tcp', baseUrl: `http://localhost:${port}`, port }
    }
    initDb(migrationsFolder)
    const app = createApp({ corsOrigins })
    if (staticDir) {
      app.use('/*', serveStatic({ root: staticDir }))
    }
    return startTcpServer(app, port, setServer)
  }

  initDb(migrationsFolder)
  const app = createApp({ corsOrigins })
  if (staticDir) {
    app.use('/*', serveStatic({ root: staticDir }))
  }

  const socketPath = getIpcPath(userDataPath)
  try {
    return await startIpcServer(app, socketPath, setServer, setIpcPath)
  } catch (err) {
    console.warn('IPC transport failed, falling back to TCP on random port:', err)
    return startTcpServer(app, 0, setServer)
  }
}

export function stopRuntime(): Promise<void> {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        server = null
        if (ipcPath && process.platform !== 'win32' && fs.existsSync(ipcPath)) {
          try {
            fs.unlinkSync(ipcPath)
          } catch {
            // ignore
          }
          ipcPath = null
        }
        closeDb()
        resolve()
      })
    } else {
      if (ipcPath && process.platform !== 'win32' && fs.existsSync(ipcPath)) {
        try {
          fs.unlinkSync(ipcPath)
        } catch {
          // ignore
        }
        ipcPath = null
      }
      closeDb()
      resolve()
    }
  })
}
