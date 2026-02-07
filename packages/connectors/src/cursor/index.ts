import type { Connector, DetectionResult, ImportResult } from '../types'

export const cursorConnector: Connector = {
  name: 'cursor',
  async detect(_projectPath?: string): Promise<DetectionResult> {
    // TODO: Check for ~/.cursor/ or project .cursorrules
    return { detected: false, paths: {} }
  },
  async import(_projectPath?: string): Promise<ImportResult> {
    // TODO: Parse Cursor config files
    return { agents: [], skills: [] }
  },
  async export(_agents, _skills, _projectPath?: string): Promise<void> {
    // TODO: Write back to Cursor format
  },
}
