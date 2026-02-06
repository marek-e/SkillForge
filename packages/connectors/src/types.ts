import type { Agent, Skill } from '@skillforge/core'

export interface Connector {
  name: string
  detect(): Promise<boolean>
  import(): Promise<{ agents: Agent[]; skills: Skill[] }>
  export(agents: Agent[], skills: Skill[]): Promise<void>
}
