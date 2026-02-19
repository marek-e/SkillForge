import { randomUUID } from 'node:crypto'
import { CreateSkillSchema } from '@skillforge/core'
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
