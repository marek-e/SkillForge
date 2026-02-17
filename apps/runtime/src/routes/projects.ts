import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { Hono } from 'hono'
import {
  claudeCodeConnector,
  cursorConnector,
  codexConnector,
  geminiCliConnector,
  openCodeConnector,
} from '@skillforge/connectors'
import type { DetectedTool, Project } from '@skillforge/core'
import { store } from '../store'

export const projectRoutes = new Hono()

projectRoutes.get('/', (c) => {
  return c.json({ data: store.projects.getAll() })
})

projectRoutes.get('/:id', (c) => {
  const project = store.projects.getById(c.req.param('id'))
  if (!project) {
    return c.json({ error: { message: 'Project not found', code: 'NOT_FOUND' } }, 404)
  }
  return c.json({ data: project })
})

projectRoutes.post('/', async (c) => {
  const body = await c.req.json<{ path?: string }>()
  const projectPath = body.path?.trim()

  if (!projectPath) {
    return c.json({ error: { message: 'Path is required', code: 'VALIDATION_ERROR' } }, 400)
  }
  if (!existsSync(projectPath)) {
    return c.json(
      {
        error: {
          message: 'Directory does not exist',
          code: 'VALIDATION_ERROR',
        },
      },
      400
    )
  }

  const connectors = [
    { name: 'claude-code', connector: claudeCodeConnector },
    { name: 'cursor', connector: cursorConnector },
    { name: 'codex', connector: codexConnector },
    { name: 'gemini-cli', connector: geminiCliConnector },
    { name: 'opencode', connector: openCodeConnector },
  ]

  const results = await Promise.all(
    connectors.map(async ({ name, connector }) => {
      const { detected } = await connector.detectProject(projectPath)
      return { name, detected } satisfies DetectedTool
    })
  )

  const now = new Date().toISOString()
  const project: Project = {
    id: randomUUID(),
    name: path.basename(projectPath),
    path: projectPath,
    iconPath: null,
    isFavorite: false,
    detectedTools: results,
    createdAt: now,
    updatedAt: now,
  }

  try {
    store.projects.create(project)
  } catch (err) {
    if (err instanceof Error && err.message.includes('UNIQUE constraint')) {
      return c.json(
        {
          error: {
            message: 'Project at this path already exists',
            code: 'CONFLICT',
          },
        },
        409
      )
    }
    throw err
  }

  return c.json({ data: project }, 201)
})

projectRoutes.patch('/:id', async (c) => {
  const body = await c.req.json<{ name?: string; iconPath?: string | null }>()
  const project = store.projects.update(c.req.param('id'), body)
  if (!project) {
    return c.json({ error: { message: 'Project not found', code: 'NOT_FOUND' } }, 404)
  }
  return c.json({ data: project })
})

projectRoutes.delete('/:id', (c) => {
  const deleted = store.projects.delete(c.req.param('id'))
  if (!deleted) {
    return c.json({ error: { message: 'Project not found', code: 'NOT_FOUND' } }, 404)
  }
  return c.json({ data: { success: true } })
})

projectRoutes.post('/:id/refresh-tools', async (c) => {
  const project = store.projects.getById(c.req.param('id'))
  if (!project) {
    return c.json({ error: { message: 'Project not found', code: 'NOT_FOUND' } }, 404)
  }

  const connectors = [
    { name: 'claude-code', connector: claudeCodeConnector },
    { name: 'cursor', connector: cursorConnector },
    { name: 'codex', connector: codexConnector },
    { name: 'gemini-cli', connector: geminiCliConnector },
    { name: 'opencode', connector: openCodeConnector },
  ]

  const results = await Promise.all(
    connectors.map(async ({ name, connector }) => {
      const { detected } = await connector.detectProject(project.path)
      return { name, detected } satisfies DetectedTool
    })
  )

  const updated = store.projects.updateDetectedTools(project.id, results)
  return c.json({ data: updated })
})

projectRoutes.patch('/:id/favorite', (c) => {
  const project = store.projects.toggleFavorite(c.req.param('id'))
  if (!project) {
    return c.json({ error: { message: 'Project not found', code: 'NOT_FOUND' } }, 404)
  }
  return c.json({ data: project })
})
