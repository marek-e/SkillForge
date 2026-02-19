import { readFile, readdir, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { dirname, join, resolve } from 'node:path'
import { CreateSkillSchema, SkillSchema } from '@skillforge/core'
import { Hono } from 'hono'
import { store } from '../store'

export const skillRoutes = new Hono()

skillRoutes.get('/', (c) => {
  return c.json({ data: store.skills.getAll() })
})

skillRoutes.get('/:id', (c) => {
  const skill = store.skills.getById(c.req.param('id'))
  if (!skill) {
    return c.json({ error: { message: 'Skill not found', code: 'NOT_FOUND' } }, 404)
  }
  return c.json({ data: skill })
})

skillRoutes.get('/:id/content', async (c) => {
  const skill = store.skills.getById(c.req.param('id'))
  if (!skill) {
    return c.json({ error: { message: 'Skill not found', code: 'NOT_FOUND' } }, 404)
  }
  if (!skill.implementationRef) {
    return c.json({ error: { message: 'Skill has no associated file', code: 'NO_FILE' } }, 404)
  }
  try {
    const content = await readFile(skill.implementationRef, 'utf-8')
    return c.json({ data: { content } })
  } catch {
    return c.json({ error: { message: 'File not found on disk', code: 'FILE_NOT_FOUND' } }, 404)
  }
})

skillRoutes.post('/', async (c) => {
  const body = await c.req.json<unknown>()
  const result = CreateSkillSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: { message: 'Invalid skill data', code: 'VALIDATION_ERROR' } }, 400)
  }
  const now = new Date().toISOString()
  const skill = store.skills.create({
    ...result.data,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  })
  return c.json({ data: skill }, 201)
})

skillRoutes.patch('/:id', async (c) => {
  const skill = store.skills.getById(c.req.param('id'))
  if (!skill) {
    return c.json({ error: { message: 'Skill not found', code: 'NOT_FOUND' } }, 404)
  }
  const body = await c.req.json<unknown>()
  const result = SkillSchema.pick({ name: true, description: true, body: true })
    .partial()
    .safeParse(body)
  if (!result.success) {
    return c.json({ error: { message: 'Invalid skill data', code: 'VALIDATION_ERROR' } }, 400)
  }
  const updated = store.skills.update(c.req.param('id'), result.data)
  return c.json({ data: updated })
})

skillRoutes.put('/:id/content', async (c) => {
  const skill = store.skills.getById(c.req.param('id'))
  if (!skill) {
    return c.json({ error: { message: 'Skill not found', code: 'NOT_FOUND' } }, 404)
  }
  if (!skill.implementationRef) {
    return c.json({ error: { message: 'Skill has no associated file', code: 'NO_FILE' } }, 404)
  }
  const body = await c.req.json<{ content: string }>()
  await writeFile(skill.implementationRef, body.content, 'utf-8')
  return c.json({ data: { success: true } })
})

skillRoutes.get('/:id/directory', async (c) => {
  const skill = store.skills.getById(c.req.param('id'))
  if (!skill) {
    return c.json({ error: { message: 'Skill not found', code: 'NOT_FOUND' } }, 404)
  }
  if (!skill.implementationRef) {
    return c.json({ error: { message: 'Skill has no associated file', code: 'NO_FILE' } }, 404)
  }
  const skillDir = dirname(skill.implementationRef)
  try {
    const entries = await readdir(skillDir, { recursive: true })
    const files = (entries as string[])
      .filter((e) => {
        const abs = resolve(skillDir, e)
        return abs.startsWith(skillDir + '/')
      })
      .sort((a, b) => {
        if (a === 'SKILL.md') return -1
        if (b === 'SKILL.md') return 1
        return a.localeCompare(b)
      })
    return c.json({ data: { directory: skillDir, files } })
  } catch {
    return c.json({ error: { message: 'Directory not found on disk', code: 'DIR_NOT_FOUND' } }, 404)
  }
})

skillRoutes.get('/:id/file', async (c) => {
  const skill = store.skills.getById(c.req.param('id'))
  if (!skill) {
    return c.json({ error: { message: 'Skill not found', code: 'NOT_FOUND' } }, 404)
  }
  if (!skill.implementationRef) {
    return c.json({ error: { message: 'Skill has no associated file', code: 'NO_FILE' } }, 404)
  }
  const relativePath = c.req.query('path')
  if (!relativePath) {
    return c.json({ error: { message: 'path query param required', code: 'MISSING_PARAM' } }, 400)
  }
  const skillDir = dirname(skill.implementationRef)
  const target = resolve(join(skillDir, relativePath))
  if (!target.startsWith(skillDir + '/') && target !== skillDir) {
    return c.json({ error: { message: 'Path traversal not allowed', code: 'FORBIDDEN' } }, 403)
  }
  try {
    const content = await readFile(target, 'utf-8')
    return c.json({ data: { content } })
  } catch {
    return c.json({ error: { message: 'File not found on disk', code: 'FILE_NOT_FOUND' } }, 404)
  }
})

skillRoutes.put('/:id/file', async (c) => {
  const skill = store.skills.getById(c.req.param('id'))
  if (!skill) {
    return c.json({ error: { message: 'Skill not found', code: 'NOT_FOUND' } }, 404)
  }
  if (!skill.implementationRef) {
    return c.json({ error: { message: 'Skill has no associated file', code: 'NO_FILE' } }, 404)
  }
  const relativePath = c.req.query('path')
  if (!relativePath) {
    return c.json({ error: { message: 'path query param required', code: 'MISSING_PARAM' } }, 400)
  }
  const skillDir = dirname(skill.implementationRef)
  const target = resolve(join(skillDir, relativePath))
  if (!target.startsWith(skillDir + '/') && target !== skillDir) {
    return c.json({ error: { message: 'Path traversal not allowed', code: 'FORBIDDEN' } }, 403)
  }
  const reqBody = await c.req.json<{ content: string }>()
  await writeFile(target, reqBody.content, 'utf-8')
  return c.json({ data: { success: true } })
})

skillRoutes.delete('/:id', (c) => {
  const deleted = store.skills.delete(c.req.param('id'))
  if (!deleted) {
    return c.json({ error: { message: 'Skill not found', code: 'NOT_FOUND' } }, 404)
  }
  return c.json({ data: { success: true } })
})
