# Architecture

## Monorepo Structure

pnpm workspaces:

```
apps/
  ui/           # Vite + React frontend (NO filesystem access)
  runtime/      # Node.js 20 local runtime (Hono or Fastify)
packages/
  core/         # Canonical models and shared logic
  connectors/   # Per-tool adapters (Cursor, Claude Code, etc.)
```

## Tech Stack

**UI:** Vite, React, TypeScript, TanStack Router, TanStack Query, Tailwind CSS, Monaco Editor, shadcn/ui (Radix Nova)

**Runtime:** Node.js 20, TypeScript, Hono or Fastify, Zod, chokidar

## Routing

The UI uses **code-based routing** with TanStack Router (not file-based). This approach is preferred for AI agentic coding because:

- All routes are explicit and discoverable in one place
- Type-safe route references
- Easy for AI to understand and modify
- No convention magic to reason about

### Route Structure

Routes are organized in `apps/ui/src/routes/`:

```
routes/
  __root.tsx    # Root route with Layout component
  home.tsx      # Index route (/)
  agents.tsx    # Agents route (/agents)
  skills.tsx    # Skills route (/skills)
  index.ts      # Barrel export for all routes
```

Each route file exports a route created with `createRoute()`. Routes are composed in `App.tsx`:

```tsx
const routeTree = rootRoute.addChildren([indexRoute, agentsRoute, skillsRoute])
const router = createRouter({ routeTree })
```

### Adding a New Route

1. Create `routes/new-route.tsx`:
   ```tsx
   import { createRoute } from '@tanstack/react-router'
   import { rootRoute } from './__root'
   
   export const newRoute = createRoute({
     getParentRoute: () => rootRoute,
     path: '/new-path',
     component: NewComponent,
   })
   ```

2. Export from `routes/index.ts`:
   ```tsx
   export { newRoute } from './new-route'
   ```

3. Add to route tree in `App.tsx`:
   ```tsx
   const routeTree = rootRoute.addChildren([indexRoute, agentsRoute, skillsRoute, newRoute])
   ```

## UI Components

See [UI Components](ui-components.md) for a complete list of available components, including typography elements and base UI primitives.

## Key Constraints

1. **Canonical model is sacred** — All tool configurations normalize to one internal schema. No tool-specific logic in the UI.

2. **UI is runtime-agnostic** — Must work as web app now and in Electron later without rewrites.

3. **UI has no filesystem access** — All file operations go through the runtime's localhost HTTP/JSON API.

4. **Import/export flow:**
   - Import: tool format → canonical model (may be lossy, show warnings)
   - Export: canonical model → tool format
