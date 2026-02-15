import type { Agent, DetectedTool, Project, Skill } from '@skillforge/core'
import { eq } from 'drizzle-orm'
import { getDb } from './db'
import { agents, projects, skills } from './schema'

type AgentRow = typeof agents.$inferSelect
type SkillRow = typeof skills.$inferSelect
type ProjectRow = typeof projects.$inferSelect

function agentFromRow(row: AgentRow): Agent {
  return {
    id: row.id,
    name: row.name,
    sourceTool: row.sourceTool as Agent['sourceTool'],
    enabledSkills: JSON.parse(row.enabledSkills),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function projectFromRow(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    path: row.path,
    iconPath: row.iconPath,
    isFavorite: row.isFavorite,
    detectedTools: JSON.parse(row.detectedTools) as DetectedTool[],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function skillFromRow(row: SkillRow): Skill {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    inputSchema: row.inputSchema ? JSON.parse(row.inputSchema) : undefined,
    outputSchema: row.outputSchema ? JSON.parse(row.outputSchema) : undefined,
    implementationRef: row.implementationRef ?? undefined,
    source: row.source as Skill['source'],
    originalTool: (row.originalTool as Skill['originalTool']) ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export const store = {
  agents: {
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
          enabledSkills: JSON.stringify(agent.enabledSkills),
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
          enabledSkills: JSON.stringify(updated.enabledSkills),
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
  },
  skills: {
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
          inputSchema: skill.inputSchema ? JSON.stringify(skill.inputSchema) : null,
          outputSchema: skill.outputSchema ? JSON.stringify(skill.outputSchema) : null,
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
          inputSchema: updated.inputSchema ? JSON.stringify(updated.inputSchema) : null,
          outputSchema: updated.outputSchema ? JSON.stringify(updated.outputSchema) : null,
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
  },
  projects: {
    getAll: (): Project[] => {
      const rows = getDb().select().from(projects).all()
      const mapped = rows.map(projectFromRow)
      return mapped.sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1
        return a.name.localeCompare(b.name)
      })
    },
    getById: (id: string): Project | undefined => {
      const row = getDb().select().from(projects).where(eq(projects.id, id)).get()
      return row ? projectFromRow(row) : undefined
    },
    create: (project: Project): Project => {
      getDb()
        .insert(projects)
        .values({
          id: project.id,
          name: project.name,
          path: project.path,
          iconPath: project.iconPath,
          isFavorite: project.isFavorite,
          detectedTools: JSON.stringify(project.detectedTools),
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        })
        .run()
      return project
    },
    update: (id: string, updates: Partial<Pick<Project, 'name' | 'iconPath'>>): Project | null => {
      const row = getDb().select().from(projects).where(eq(projects.id, id)).get()
      if (!row) return null
      const existing = projectFromRow(row)
      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }
      getDb()
        .update(projects)
        .set({
          name: updated.name,
          iconPath: updated.iconPath,
          updatedAt: updated.updatedAt,
        })
        .where(eq(projects.id, id))
        .run()
      return updated
    },
    delete: (id: string): boolean => {
      const result = getDb().delete(projects).where(eq(projects.id, id)).run()
      return result.changes > 0
    },
    toggleFavorite: (id: string): Project | null => {
      const row = getDb().select().from(projects).where(eq(projects.id, id)).get()
      if (!row) return null
      const project = projectFromRow(row)
      const updated = {
        ...project,
        isFavorite: !project.isFavorite,
        updatedAt: new Date().toISOString(),
      }
      getDb()
        .update(projects)
        .set({
          isFavorite: updated.isFavorite,
          updatedAt: updated.updatedAt,
        })
        .where(eq(projects.id, id))
        .run()
      return updated
    },
  },
}
