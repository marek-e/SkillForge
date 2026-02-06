import type { Connector } from '../types'

export const cursorConnector: Connector = {
  name: 'cursor',
  async detect() {
    // TODO: Check for ~/.cursor/ or project .cursorrules
    return false
  },
  async import() {
    // TODO: Parse Cursor config files
    return { agents: [], skills: [] }
  },
  async export() {
    // TODO: Write back to Cursor format
  },
}
