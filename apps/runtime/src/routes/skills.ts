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
