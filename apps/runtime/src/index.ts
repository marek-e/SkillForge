import { serve } from '@hono/node-server'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApp } from './app'
import { closeDb, initDb } from './store/db'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsFolder = path.resolve(__dirname, '../drizzle')

initDb(migrationsFolder)

const app = createApp({
  corsOrigins: ['http://localhost:4320'],
})

const PORT = process.env.PORT || 4321

console.log(`SkillForge Runtime starting on http://localhost:${PORT}`)

serve({
  fetch: app.fetch,
  port: Number(PORT),
})

function shutdown() {
  closeDb()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
