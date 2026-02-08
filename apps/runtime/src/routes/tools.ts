import { Hono } from 'hono'
import {
  claudeCodeConnector,
  listGlobalCommands,
  listGlobalSkills,
} from '@skillforge/connectors'
import type { ToolStatus } from '@skillforge/core'

export const toolRoutes = new Hono()

toolRoutes.get('/', async (c) => {
  const detection = await claudeCodeConnector.detect()
  const commands = await listGlobalCommands()
  const skills = await listGlobalSkills()

  const tools: ToolStatus[] = [
    {
      name: 'claude-code',
      detected: detection.detected,
      paths: {
        globalDir: detection.paths.globalDir,
        projectDir: detection.paths.projectDir,
      },
      commandCount: commands.length,
      skillCount: skills.length,
    },
  ]

  return c.json({ data: tools })
})

toolRoutes.get('/claude-code/commands', async (c) => {
  const commands = await listGlobalCommands()
  return c.json({ data: commands })
})

toolRoutes.get('/claude-code/skills', async (c) => {
  const skills = await listGlobalSkills()
  return c.json({ data: skills })
})
