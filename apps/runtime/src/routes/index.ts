import { Hono } from 'hono'
import { healthRoutes } from './health'
import { agentRoutes } from './agents'
import { projectRoutes } from './projects'
import { skillRoutes } from './skills'
import { toolRoutes } from './tools'

export const routes = new Hono()

routes.route('/health', healthRoutes)
routes.route('/agents', agentRoutes)
routes.route('/projects', projectRoutes)
routes.route('/skills', skillRoutes)
routes.route('/tools', toolRoutes)
