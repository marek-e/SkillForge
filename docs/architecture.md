# Architecture

**See also:** [Architecture Diagram](architecture-diagram.md) for visual dependency graph

## Monorepo Structure

pnpm workspaces:

```
apps/
  ui/           # Vite + React frontend (NO filesystem access)
  runtime/      # Node.js 20 local runtime (Hono)
  electron/     # Electron desktop wrapper
packages/
  core/         # Canonical models and shared logic
  connectors/   # Per-tool adapters (Cursor, Claude Code, etc.)
```

## Tech Stack

**UI:** Vite, React, TypeScript, TanStack Router, TanStack Query, Tailwind CSS, Monaco Editor, shadcn/ui (Radix Nova)

**Runtime:** Node.js 20, TypeScript, Hono, Zod, chokidar

**Electron:** Electron 40+, custom titlebar, IPC bridge

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

## Deployment Modes

SkillForge runs in two modes:

### Web Mode (`pnpm web:dev`)

- Runtime server on :4321 (serves API + static UI in production)
- UI dev server on :4320 (Vite HMR in dev)
- CORS enabled for development

### Electron Mode (`pnpm electron:dev`)

- Embedded runtime server on :4321
- UI dev server on :4320 (Vite HMR in dev)
- Custom titlebar with native macOS traffic lights / Windows controls
- IPC bridge for window operations (minimize, maximize, close)
- Packaged app embeds pre-built UI (no external servers)

## Electron Architecture

The Electron app uses a **hidden native titlebar** (`titleBarStyle: 'hidden'`) with a custom React component for the titlebar region.

### Titlebar Design

**Component:** `apps/ui/src/components/electron-titlebar.tsx`

- **Height:** 36px (h-9) full-width bar at the top of the window
- **macOS:** Traffic lights positioned at `{ x: 12, y: 12 }` in the native titlebar space; custom titlebar reserves 80px left space
- **Windows/Linux:** Custom minimize/maximize/close buttons on the right using `titleBarOverlay` with transparent background
- **Drag region:** The entire titlebar is draggable (`.drag` CSS class with `-webkit-app-region: drag`)
- **Interactive elements:** Window control buttons use `.no-drag` to remain clickable

### Sidebar Offset

The UI's sidebar uses `fixed` positioning that normally spans `inset-y-0 h-svh` (full viewport). In Electron, CSS rules offset the sidebar:

```css
.electron-app [data-slot='sidebar-container'] {
  top: 2.25rem;
  height: calc(100svh - 2.25rem);
}
```

This prevents the sidebar from overlapping the Electron titlebar and traffic lights.

### IPC Bridge

**Preload script:** `apps/electron/src/preload.ts` exposes window control methods via `contextBridge`:

```ts
window.electronAPI = {
  isElectron: true,
  platform: process.platform,
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
}
```

**Main process:** `apps/electron/src/main.ts` handles IPC calls to manipulate the `BrowserWindow`.

### App Icon

- **Source:** `apps/ui/public/anvil.svg` (512x512 indigo anvil icon)
- **Converted to:** `apps/electron/icon.png` (runtime icon)
- **electron-builder:** Converts PNG to platform formats (.icns for macOS, .ico for Windows)

### Type Safety

The `ElectronAPI` interface is defined in `apps/ui/src/lib/electron.ts` and imported where needed:

```ts
import type { ElectronWindow } from '@/lib/electron'
const isElectron =
  typeof window !== 'undefined' && !!(window as ElectronWindow).electronAPI?.isElectron
```

## Key Constraints

1. **Canonical model is sacred** — All tool configurations normalize to one internal schema. No tool-specific logic in the UI.

2. **UI is runtime-agnostic** — Works identically in web and Electron modes. No environment-specific features except the Electron titlebar.

3. **UI has no filesystem access** — All file operations go through the runtime's localhost HTTP/JSON API.

4. **Import/export flow:**
   - Import: tool format → canonical model (may be lossy, show warnings)
   - Export: canonical model → tool format
