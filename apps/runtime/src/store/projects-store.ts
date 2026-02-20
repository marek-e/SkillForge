import type { DetectedTool, Project } from '@skillforge/core'
import { ProjectSchema } from '@skillforge/core'
import { eq } from 'drizzle-orm'
import { getDb } from './db'
import { projects } from './schema'
import { deserializeJsonField, serializeJsonField } from './serializers'

type ProjectRow = typeof projects.$inferSelect

function projectFromRow(row: ProjectRow): Project {
  return ProjectSchema.parse({
    ...row,
    preferredEditor: row.preferredEditor ?? null,
    customEditorCmd: row.customEditorCmd ?? null,
    detectedTools: deserializeJsonField(row.detectedTools, []),
  })
}

export const projectsStore = {
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
        preferredEditor: project.preferredEditor,
        customEditorCmd: project.customEditorCmd,
        isFavorite: project.isFavorite,
        detectedTools: serializeJsonField(project.detectedTools),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })
      .run()
    return project
  },
  update: (
    id: string,
    updates: Partial<Pick<Project, 'name' | 'iconPath' | 'preferredEditor' | 'customEditorCmd'>>
  ): Project | null => {
    const row = getDb().select().from(projects).where(eq(projects.id, id)).get()
    if (!row) return null
    const existing = projectFromRow(row)
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }
    getDb()
      .update(projects)
      .set({
        name: updated.name,
        iconPath: updated.iconPath,
        preferredEditor: updated.preferredEditor,
        customEditorCmd: updated.customEditorCmd,
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
  updateDetectedTools: (id: string, detectedTools: DetectedTool[]): Project | null => {
    const row = getDb().select().from(projects).where(eq(projects.id, id)).get()
    if (!row) return null
    const existing = projectFromRow(row)
    const updated = { ...existing, detectedTools, updatedAt: new Date().toISOString() }
    getDb()
      .update(projects)
      .set({
        detectedTools: serializeJsonField(detectedTools),
        updatedAt: updated.updatedAt,
      })
      .where(eq(projects.id, id))
      .run()
    return updated
  },
}
