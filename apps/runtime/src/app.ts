import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { routes } from './routes'

export interface CreateAppOptions {
  corsOrigins?: string[]
}

export function createApp(options: CreateAppOptions = {}) {
  const app = new Hono()

  app.use('*', logger())

  if (options.corsOrigins && options.corsOrigins.length > 0) {
    app.use(
      '*',
      cors({
        origin: options.corsOrigins,
        allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      })
    )
  }

  app.route('/api', routes)

  app.get('/', (c) => c.redirect('/api/health'))

  return app
}
