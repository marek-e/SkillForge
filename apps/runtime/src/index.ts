import { serve } from '@hono/node-server'
import { createApp } from './app'

const app = createApp({
  corsOrigins: ['http://localhost:4320'],
})

const PORT = process.env.PORT || 4321

console.log(`SkillForge Runtime starting on http://localhost:${PORT}`)

serve({
  fetch: app.fetch,
  port: Number(PORT),
})
