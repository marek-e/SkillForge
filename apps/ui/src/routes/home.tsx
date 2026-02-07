import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-4">Welcome to SkillForge</h1>
      <p className="text-muted-foreground">
        Visualize, manage, and normalize agent skills across tools.
      </p>
    </div>
  ),
})
