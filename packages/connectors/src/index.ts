export * from './types'
export { claudeCodeConnector, listGlobalCommands, listGlobalSkills } from './claude-code'
export { cursorConnector, listCursorSkills } from './cursor'
export { codexConnector, listCodexSkills } from './codex'
export { geminiCliConnector, listGeminiCliSkills } from './gemini-cli'
export { openCodeConnector, listOpenCodeSkills } from './opencode'

import type { Connector } from './types'
import { claudeCodeConnector } from './claude-code'
import { cursorConnector } from './cursor'
import { codexConnector } from './codex'
import { geminiCliConnector } from './gemini-cli'
import { openCodeConnector } from './opencode'

/** All available connectors, in consistent order. */
export const allConnectors: Connector[] = [
  claudeCodeConnector,
  cursorConnector,
  codexConnector,
  geminiCliConnector,
  openCodeConnector,
]
