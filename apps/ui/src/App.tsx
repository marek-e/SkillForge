import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ThemeProvider } from 'next-themes'
import { Toaster } from './components/ui/toaster'
import { TooltipProvider } from './components/ui/tooltip'
import {
  rootRoute,
  indexRoute,
  toolsRoute,
  skillLibraryRoute,
  skillDetailRoute,
  projectsRoute,
  projectDetailRoute,
  settingsRoute,
  toolDetailRoute,
} from './routes'

const queryClient = new QueryClient()

const routeTree = rootRoute.addChildren([
  indexRoute,
  toolsRoute,
  skillLibraryRoute,
  skillDetailRoute,
  projectsRoute,
  projectDetailRoute,
  settingsRoute,
  toolDetailRoute,
])
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <RouterProvider router={router} />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
