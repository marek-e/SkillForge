import { Hono } from 'hono'
import {
  allConnectors,
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
  const skillListers: Record<string, () => Promise<unknown[]>> = {
    'claude-code': listGlobalSkills,
    cursor: listCursorSkills,
    codex: listCodexSkills,
    'gemini-cli': listGeminiCliSkills,
    opencode: listOpenCodeSkills,
  }

  const [detections, commands, ...skillResults] = await Promise.all([
    Promise.all(allConnectors.map((c) => c.detectGlobal())),
    listGlobalCommands(),
    ...allConnectors.map((c) => skillListers[c.name]()),
  ])

  const tools: ToolStatus[] = allConnectors.map((connector, i) => ({
    name: connector.name,
    detected: detections[i].detected,
    paths: { globalDir: detections[i].globalDir },
    commandCount: connector.name === 'claude-code' ? commands.length : 0,
    skillCount: skillResults[i].length,
  }))

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
