import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { H1, Lead } from '@/components/typography'

export const skillLibraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/skill-library',
  component: SkillLibraryPage,
})

function SkillLibraryPage() {
  return (
    <div className="space-y-6">
      <div>
        <H1>Skill Library</H1>
        <Lead>Browse and manage reusable skills.</Lead>
      </div>
    </div>
  )
}
