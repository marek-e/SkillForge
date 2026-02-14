import fs from 'node:fs'
import path from 'node:path'
import { createAdaptorServer } from '@hono/node-server'
import type { ServerType } from '@hono/node-server'
import type { createApp } from '@skillforge/runtime/app'
import type { RuntimeEndpointInfo } from '../runtime-bridge'

export function getIpcPath(userDataPath: string): string {
  if (process.platform === 'win32') {
    return `\\\\.\\pipe\\skillforge-runtime-${process.pid}`
  }
  return path.join(userDataPath, 'runtime.sock')
}

export function startIpcServer(
  app: ReturnType<typeof createApp>,
  socketPath: string,
  setServer: (s: ServerType) => void,
  setIpcPath: (p: string | null) => void
): Promise<RuntimeEndpointInfo> {
  return new Promise((resolve, reject) => {
    const s = createAdaptorServer({ fetch: app.fetch })
    setServer(s as unknown as ServerType)

    const dir = path.dirname(socketPath)
    if (dir && dir !== '.' && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    if (process.platform !== 'win32' && fs.existsSync(socketPath)) {
      try {
        fs.unlinkSync(socketPath)
      } catch (e) {
        reject(new Error(`Could not remove stale socket ${socketPath}: ${e}`))
        return
      }
    }

    s.listen(socketPath, () => {
      setIpcPath(socketPath)
      console.log(`SkillForge Runtime started on IPC ${socketPath}`)
      resolve({
        transport: 'ipc',
        baseUrl: 'skillforge://app',
        ipcPath: socketPath,
      })
    })
    s.on('error', (err: NodeJS.ErrnoException) => {
      setServer(null as unknown as ServerType)
      setIpcPath(null)
      reject(err)
    })
  })
}
