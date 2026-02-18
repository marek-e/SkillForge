import type { Agent } from '@skillforge/core'
import { AgentSchema } from '@skillforge/core'
import { eq } from 'drizzle-orm'
import { getDb } from './db'
import { agents } from './schema'
import { deserializeJsonField, serializeJsonField } from './serializers'

type AgentRow = typeof agents.$inferSelect

function agentFromRow(row: AgentRow): Agent {
  return AgentSchema.parse({
    ...row,
    enabledSkills: deserializeJsonField(row.enabledSkills, []),
  })
}

export const agentsStore = {
  getAll: (): Agent[] => {
    const rows = getDb().select().from(agents).all()
    return rows.map(agentFromRow)
  },
  getById: (id: string): Agent | undefined => {
    const row = getDb().select().from(agents).where(eq(agents.id, id)).get()
    return row ? agentFromRow(row) : undefined
  },
  create: (agent: Agent): Agent => {
    getDb()
      .insert(agents)
      .values({
        id: agent.id,
        name: agent.name,
        sourceTool: agent.sourceTool,
        enabledSkills: serializeJsonField(agent.enabledSkills),
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
      })
      .run()
    return agent
  },
  update: (id: string, updates: Partial<Agent>): Agent | null => {
    const row = getDb().select().from(agents).where(eq(agents.id, id)).get()
    if (!row) return null
    const existing = agentFromRow(row)
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }
    getDb()
      .update(agents)
      .set({
        name: updated.name,
        sourceTool: updated.sourceTool,
        enabledSkills: serializeJsonField(updated.enabledSkills),
        updatedAt: updated.updatedAt,
      })
      .where(eq(agents.id, id))
      .run()
    return updated
  },
  delete: (id: string): boolean => {
    const result = getDb().delete(agents).where(eq(agents.id, id)).run()
    return result.changes > 0
  },
}
