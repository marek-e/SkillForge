import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { Toaster } from './components/ui/sonner'
import { rootRoute, indexRoute, agentsRoute, skillsRoute } from './routes'

const queryClient = new QueryClient()

const routeTree = rootRoute.addChildren([indexRoute, agentsRoute, skillsRoute])
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  )
}
