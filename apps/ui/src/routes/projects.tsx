import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { H1, Lead } from '@/components/typography'

export const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: ProjectsPage,
})

function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <H1>Projects</H1>
        <Lead>Manage your projects and their configurations.</Lead>
      </div>
    </div>
  )
}
