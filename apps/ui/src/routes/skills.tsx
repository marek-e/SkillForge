import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { SkillList } from '../components/SkillList'

export const skillsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/skills',
  component: SkillList,
})
