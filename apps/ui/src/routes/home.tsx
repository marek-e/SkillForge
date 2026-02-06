import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to SkillForge</h1>
      <p className="text-gray-600">Visualize, manage, and normalize agent skills across tools.</p>
    </div>
  ),
})
