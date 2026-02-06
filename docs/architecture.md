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

## UI Components

See [UI Components](ui-components.md) for a complete list of available components, including typography elements and base UI primitives.

## Key Constraints

1. **Canonical model is sacred** — All tool configurations normalize to one internal schema. No tool-specific logic in the UI.

2. **UI is runtime-agnostic** — Must work as web app now and in Electron later without rewrites.

3. **UI has no filesystem access** — All file operations go through the runtime's localhost HTTP/JSON API.

4. **Import/export flow:**
   - Import: tool format → canonical model (may be lossy, show warnings)
   - Export: canonical model → tool format
