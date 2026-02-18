import type { Skill } from '@skillforge/core'
import { SkillSchema } from '@skillforge/core'
import { eq } from 'drizzle-orm'
import { getDb } from './db'
import { skills } from './schema'
import { deserializeJsonField, serializeNullableJsonField } from './serializers'

type SkillRow = typeof skills.$inferSelect

function skillFromRow(row: SkillRow): Skill {
  return SkillSchema.parse({
    ...row,
    inputSchema: row.inputSchema ? deserializeJsonField(row.inputSchema) : undefined,
    outputSchema: row.outputSchema ? deserializeJsonField(row.outputSchema) : undefined,
    implementationRef: row.implementationRef ?? undefined,
    originalTool: row.originalTool ?? undefined,
  })
}

export const skillsStore = {
  getAll: (): Skill[] => {
    const rows = getDb().select().from(skills).all()
    return rows.map(skillFromRow)
  },
  getById: (id: string): Skill | undefined => {
    const row = getDb().select().from(skills).where(eq(skills.id, id)).get()
    return row ? skillFromRow(row) : undefined
  },
  create: (skill: Skill): Skill => {
    getDb()
      .insert(skills)
      .values({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        inputSchema: serializeNullableJsonField(skill.inputSchema),
        outputSchema: serializeNullableJsonField(skill.outputSchema),
        implementationRef: skill.implementationRef ?? null,
        source: skill.source,
        originalTool: skill.originalTool ?? null,
        createdAt: skill.createdAt,
        updatedAt: skill.updatedAt,
      })
      .run()
    return skill
  },
  update: (id: string, updates: Partial<Skill>): Skill | null => {
    const row = getDb().select().from(skills).where(eq(skills.id, id)).get()
    if (!row) return null
    const existing = skillFromRow(row)
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }
    getDb()
      .update(skills)
      .set({
        name: updated.name,
        description: updated.description,
        inputSchema: serializeNullableJsonField(updated.inputSchema),
        outputSchema: serializeNullableJsonField(updated.outputSchema),
        implementationRef: updated.implementationRef ?? null,
        source: updated.source,
        originalTool: updated.originalTool ?? null,
        updatedAt: updated.updatedAt,
      })
      .where(eq(skills.id, id))
      .run()
    return updated
  },
  delete: (id: string): boolean => {
    const result = getDb().delete(skills).where(eq(skills.id, id)).run()
    return result.changes > 0
  },
}
