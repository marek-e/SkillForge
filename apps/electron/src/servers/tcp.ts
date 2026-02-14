import { serve } from '@hono/node-server'
import type { ServerType } from '@hono/node-server'
import type { createApp } from '@skillforge/runtime/app'
import type { RuntimeEndpointInfo } from '../runtime-bridge'

export async function isPortInUse(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:${port}/api/health`)
    return res.ok
  } catch {
    return false
  }
}

export function startTcpServer(
  app: ReturnType<typeof createApp>,
  port: number,
  setServer: (s: ServerType) => void
): Promise<RuntimeEndpointInfo> {
  return new Promise((resolve, reject) => {
    const s = serve(
      {
        fetch: app.fetch,
        port,
      },
      (info) => {
        const actualPort = info?.port ?? port
        console.log(`SkillForge Runtime started on http://localhost:${actualPort}`)
        resolve({
          transport: 'tcp',
          baseUrl: `http://localhost:${actualPort}`,
          port: actualPort,
        })
      }
    )
    setServer(s)
    s.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} in use but health check failed — another process is using it`)
        setServer(null as unknown as ServerType)
        reject(new Error(`Port ${port} is already in use by another process. Stop it and retry.`))
      } else {
        reject(err)
      }
    })
  })
}
