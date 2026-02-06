import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { AgentList } from '../components/AgentList'

export const agentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agents',
  component: AgentList,
})
