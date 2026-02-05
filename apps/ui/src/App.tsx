import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
} from "@tanstack/react-router";
import { Layout } from "./components/Layout";
import { AgentList } from "./components/AgentList";
import { SkillList } from "./components/SkillList";

const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome to SkillForge
      </h1>
      <p className="text-gray-600">
        Visualize, manage, and normalize agent skills across tools.
      </p>
    </div>
  ),
});

const agentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/agents",
  component: AgentList,
});

const skillsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/skills",
  component: SkillList,
});

const routeTree = rootRoute.addChildren([indexRoute, agentsRoute, skillsRoute]);
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
