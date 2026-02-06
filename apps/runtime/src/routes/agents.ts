import { Hono } from 'hono'
import { store } from '../store'

export const agentRoutes = new Hono()

agentRoutes.get('/', (c) => {
  return c.json({ data: store.agents.getAll() })
})

agentRoutes.get('/:id', (c) => {
  const agent = store.agents.getById(c.req.param('id'))
  if (!agent) {
    return c.json({ error: { message: 'Agent not found', code: 'NOT_FOUND' } }, 404)
  }
  return c.json({ data: agent })
})
