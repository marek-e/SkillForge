import { Hono } from 'hono'
import {
  claudeCodeConnector,
  cursorConnector,
  codexConnector,
  geminiCliConnector,
  openCodeConnector,
  listGlobalCommands,
  listGlobalSkills,
  listCursorSkills,
  listCodexSkills,
  listGeminiCliSkills,
  listOpenCodeSkills,
} from '@skillforge/connectors'
import type { ToolStatus } from '@skillforge/core'

export const toolRoutes = new Hono()

toolRoutes.get('/', async (c) => {
  const [
    claudeDetection,
    cursorDetection,
    codexDetection,
    geminiCliDetection,
    openCodeDetection,
    commands,
    claudeSkills,
    cursorSkills,
    codexSkills,
    geminiCliSkills,
    openCodeSkills,
  ] = await Promise.all([
    claudeCodeConnector.detectGlobal(),
    cursorConnector.detectGlobal(),
    codexConnector.detectGlobal(),
    geminiCliConnector.detectGlobal(),
    openCodeConnector.detectGlobal(),
    listGlobalCommands(),
    listGlobalSkills(),
    listCursorSkills(),
    listCodexSkills(),
    listGeminiCliSkills(),
    listOpenCodeSkills(),
  ])

  const tools: ToolStatus[] = [
    {
      name: 'claude-code',
      detected: claudeDetection.detected,
      paths: {
        globalDir: claudeDetection.globalDir,
      },
      commandCount: commands.length,
      skillCount: claudeSkills.length,
    },
    {
      name: 'cursor',
      detected: cursorDetection.detected,
      paths: {
        globalDir: cursorDetection.globalDir,
      },
      commandCount: 0,
      skillCount: cursorSkills.length,
    },
    {
      name: 'codex',
      detected: codexDetection.detected,
      paths: {
        globalDir: codexDetection.globalDir,
      },
      commandCount: 0,
      skillCount: codexSkills.length,
    },
    {
      name: 'gemini-cli',
      detected: geminiCliDetection.detected,
      paths: {
        globalDir: geminiCliDetection.globalDir,
      },
      commandCount: 0,
      skillCount: geminiCliSkills.length,
    },
    {
      name: 'opencode',
      detected: openCodeDetection.detected,
      paths: {
        globalDir: openCodeDetection.globalDir,
      },
      commandCount: 0,
      skillCount: openCodeSkills.length,
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

toolRoutes.get('/codex/skills', async (c) => {
  const skills = await listCodexSkills()
  return c.json({ data: skills })
})

toolRoutes.get('/gemini-cli/skills', async (c) => {
  const skills = await listGeminiCliSkills()
  return c.json({ data: skills })
})

toolRoutes.get('/opencode/skills', async (c) => {
  const skills = await listOpenCodeSkills()
  return c.json({ data: skills })
})
