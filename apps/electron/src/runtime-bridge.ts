import { serve } from '@hono/node-server'
import { createApp } from '@skillforge/runtime/app'
import { closeDb, initDb } from '@skillforge/runtime/db'
import { serveStatic } from '@hono/node-server/serve-static'
import type { ServerType } from '@hono/node-server'

let server: ServerType | null = null

export interface StartRuntimeOptions {
  port: number
  migrationsFolder: string
  corsOrigins?: string[]
  staticDir?: string
}

async function isPortInUse(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:${port}/api/health`)
    return res.ok
  } catch {
    return false
  }
}

export async function startRuntime(options: StartRuntimeOptions): Promise<number> {
  const { port, migrationsFolder, corsOrigins, staticDir } = options

  if (await isPortInUse(port)) {
    console.log(`SkillForge Runtime already running on http://localhost:${port}, reusing`)
    return port
  }

  initDb(migrationsFolder)

  const app = createApp({ corsOrigins })

  if (staticDir) {
    app.use('/*', serveStatic({ root: staticDir }))
  }

  return new Promise((resolve, reject) => {
    server = serve(
      {
        fetch: app.fetch,
        port,
      },
      () => {
        console.log(`SkillForge Runtime started on http://localhost:${port}`)
        resolve(port)
      }
    )

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} in use but health check failed — another process is using it`)
        server = null
        reject(new Error(`Port ${port} is already in use by another process. Stop it and retry.`))
      } else {
        reject(err)
      }
    })
  })
}

export function stopRuntime(): Promise<void> {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        server = null
        closeDb()
        resolve()
      })
    } else {
      closeDb()
      resolve()
    }
  })
}
