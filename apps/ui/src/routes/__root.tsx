import { createRootRoute } from '@tanstack/react-router'
import { Layout } from '@/components/Layout'
import { NotFound } from '@/components/ui/not-found'

export const rootRoute = createRootRoute({
  component: Layout,
  notFoundComponent: NotFound,
})
