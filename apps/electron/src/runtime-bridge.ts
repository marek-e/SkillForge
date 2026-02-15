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

async function isSkillForgeRuntimeOnPort(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/api/health`)
    if (!response.ok) return false
    const payload = await response.json()
    if (!payload || typeof payload !== 'object') return false
    return 'status' in payload && payload.status === 'ok'
  } catch {
    return false
  }
}

export async function startRuntime(options: StartRuntimeOptions): Promise<RuntimeEndpointInfo> {
  const { port, migrationsFolder, corsOrigins, staticDir, useIpc, userDataPath } = options

  if (!useIpc || !userDataPath) {
    if (await isPortInUse(port)) {
      const skillForgeRuntimeRunning = await isSkillForgeRuntimeOnPort(port)
      if (skillForgeRuntimeRunning) {
        console.log(`SkillForge Runtime already running on http://localhost:${port}, reusing`)
        return { transport: 'tcp', baseUrl: `http://localhost:${port}`, port }
      }
      throw new Error(
        `Port ${port} is already in use by another process. Stop that process or set VITE_API_URL to a different runtime base URL.`
      )
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
