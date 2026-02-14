import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { H1 } from '../components/typography'
import { Lead } from '../components/typography'

function HomePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <H1>Welcome to SkillForge</H1>
        <Lead>Visualize, manage, and normalize agent skills across tools.</Lead>
      </div>
    </div>
  )
}

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})
