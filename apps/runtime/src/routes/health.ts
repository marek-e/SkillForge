import { Hono } from 'hono'
import type { HealthResponse } from '@skillforge/core'
import runtimePackageJson from '../../package.json'

export const healthRoutes = new Hono()

healthRoutes.get('/', (c) => {
  const response: HealthResponse = {
    status: 'ok',
    version: runtimePackageJson.version,
    timestamp: new Date().toISOString(),
  }
  return c.json(response)
})
