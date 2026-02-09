# Architecture Diagram

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────┐
│                          APPS LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐         ┌──────────────┐      ┌──────────────┐    │
│  │   apps/ui    │────────▶│apps/runtime  │◀─────│apps/electron │    │
│  │              │  HTTP   │              │ IPC  │              │    │
│  │ Vite + React │         │  Hono API    │      │  Electron    │    │
│  │   :4320      │         │    :4321     │      │   Wrapper    │    │
│  └──────┬───────┘         └──────┬───────┘      └──────┬───────┘    │
│         │                        │                     │            │
│         │                        │                     │            │
│         └────────────────────────┼─────────────────────┘            │
│                                  │                                  │
└──────────────────────────────────┼──────────────────────────────────┘
                                   │
                                   │ depends on
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│                        PACKAGES LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│         ┌─────────────────┐              ┌──────────────────┐       │
│         │ packages/core   │◀─────────────│packages/connectors│      │
│         │                 │   depends on │                  │       │
│         │ Domain Models   │              │  Tool Adapters   │       │
│         │  Agent, Skill   │              │ Cursor, Claude   │       │
│         │  Zod Schemas    │              │     Code, etc.   │       │
│         └─────────────────┘              └──────────────────┘       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Dependency Details

### apps/ui

- **Depends on:** None (packages used via runtime API)
- **Consumed by:** apps/electron (embeds UI), apps/runtime (serves static build)
- **Purpose:** Frontend React app, runs in browser or Electron
- **Key constraint:** NO direct filesystem access, NO direct package imports

### apps/runtime

- **Depends on:** `@skillforge/core`, `@skillforge/connectors`
- **Consumed by:** apps/ui (via HTTP), apps/electron (embedded server)
- **Purpose:** HTTP API server, handles all filesystem operations
- **Exposes:** REST API on :4321 for agent/skill CRUD

### apps/electron

- **Depends on:** apps/ui (embeds build), apps/runtime (reusable `createApp()`)
- **Consumed by:** End users (desktop app)
- **Purpose:** Desktop wrapper with custom titlebar and window controls
- **Embeds:** Runtime server + static UI build

### packages/core

- **Depends on:** None
- **Consumed by:** packages/connectors, apps/runtime
- **Purpose:** Canonical domain models (Agent, Skill) with Zod schemas
- **Exports:** Type definitions, validation schemas, shared utilities

### packages/connectors

- **Depends on:** `@skillforge/core`
- **Consumed by:** apps/runtime
- **Purpose:** Tool-specific adapters (Cursor, Claude Code)
- **Exports:** Import/export functions that normalize to/from canonical models

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Import Flow                                 │
└─────────────────────────────────────────────────────────────────────┘

Tool Config File (.cursor/skills.json)
            │
            ▼
    packages/connectors
      (CursorConnector)
            │
            ▼ normalize to
    packages/core
    (Canonical Agent/Skill)
            │
            ▼ store via
      apps/runtime
        (POST /api/agents)
            │
            ▼ fetch via
        apps/ui
      (React components)
            │
            ▼ display in
    Browser or Electron


┌─────────────────────────────────────────────────────────────────────┐
│                         Export Flow                                 │
└─────────────────────────────────────────────────────────────────────┘

      apps/ui
    (User edits skill)
            │
            ▼ save via
      apps/runtime
     (PUT /api/skills/:id)
            │
            ▼ convert from
    packages/core
    (Canonical Skill)
            │
            ▼
    packages/connectors
      (CursorConnector)
            │
            ▼ write to
Tool Config File (.cursor/skills.json)
```

## Communication Patterns

### Web Mode

```
Browser
   │
   │ HTTP GET/POST/PUT/DELETE
   │
   ▼
apps/runtime (:4321)
   │
   │ import from
   │
   ▼
packages/connectors ──depends on──▶ packages/core
   │
   │ read/write
   │
   ▼
Filesystem (~/.cursor, ~/.claude)
```

### Electron Mode

```
Electron Window
   │
   ├─── renders ────▶ apps/ui (localhost:4320 in dev)
   │
   └─── embeds ─────▶ apps/runtime (:4321)
            │
            │ import from
            │
            ▼
   packages/connectors ──depends on──▶ packages/core
            │
            │ read/write
            │
            ▼
   Filesystem (~/.cursor, ~/.claude)
```

## Key Architectural Decisions

1. **UI has zero package dependencies** — Prevents filesystem access, keeps UI portable
2. **Runtime is the gateway** — All filesystem/tool operations go through HTTP API
3. **Core is the source of truth** — Single canonical model prevents drift
4. **Connectors are pure functions** — Stateless normalize/denormalize adapters
5. **Electron reuses runtime** — No duplication, shared `createApp()` module
