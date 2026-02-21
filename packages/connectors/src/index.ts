export * from './types'
export {
  claudeCodeConnector,
  listGlobalCommands,
  listGlobalSkills,
  listProjectClaudeCodeSkills,
} from './claude-code'
export { cursorConnector, listCursorSkills, listProjectCursorSkills } from './cursor'
export { codexConnector, listCodexSkills, listProjectCodexSkills } from './codex'
export { geminiCliConnector, listGeminiCliSkills, listProjectGeminiCliSkills } from './gemini-cli'
export { openCodeConnector, listOpenCodeSkills, listProjectOpenCodeSkills } from './opencode'
export { copilotConnector, listCopilotSkills, listProjectCopilotSkills } from './copilot'
export { vibeConnector, listVibeSkills, listProjectVibeSkills } from './vibe'

import type { Connector } from './types'
import { claudeCodeConnector } from './claude-code'
import { cursorConnector } from './cursor'
import { codexConnector } from './codex'
import { geminiCliConnector } from './gemini-cli'
import { openCodeConnector } from './opencode'
import { copilotConnector } from './copilot'
import { vibeConnector } from './vibe'

/** All available connectors, in consistent order. */
export const allConnectors: Connector[] = [
  claudeCodeConnector,
  cursorConnector,
  codexConnector,
  geminiCliConnector,
  openCodeConnector,
  copilotConnector,
  vibeConnector,
]
