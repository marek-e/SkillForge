import { Hono } from 'hono'
import {
  claudeCodeConnector,
  cursorConnector,
  listGlobalCommands,
  listGlobalSkills,
  listCursorSkills,
} from '@skillforge/connectors'
import type { ToolStatus } from '@skillforge/core'

export const toolRoutes = new Hono()

toolRoutes.get('/', async (c) => {
  const [claudeDetection, cursorDetection, commands, claudeSkills, cursorSkills] =
    await Promise.all([
      claudeCodeConnector.detect(),
      cursorConnector.detect(),
      listGlobalCommands(),
      listGlobalSkills(),
      listCursorSkills(),
    ])

  const tools: ToolStatus[] = [
    {
      name: 'claude-code',
      detected: claudeDetection.detected,
      paths: {
        globalDir: claudeDetection.paths.globalDir,
        projectDir: claudeDetection.paths.projectDir,
      },
      commandCount: commands.length,
      skillCount: claudeSkills.length,
    },
    {
      name: 'cursor',
      detected: cursorDetection.detected,
      paths: {
        globalDir: cursorDetection.paths.globalDir,
        projectDir: cursorDetection.paths.projectDir,
      },
      commandCount: 0,
      skillCount: cursorSkills.length,
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

toolRoutes.get('/cursor/skills', async (c) => {
  const skills = await listCursorSkills()
  return c.json({ data: skills })
})
