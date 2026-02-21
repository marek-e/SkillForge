# Code Quality

## TypeScript

- Strict mode enabled
- No `any` types

## UI Shared Utilities (`apps/ui/src/lib/`)

Reusable constants and helpers used by more than one route or component belong in `apps/ui/src/lib/`, not defined locally in route files.

| File              | Purpose                                                                           |
| ----------------- | --------------------------------------------------------------------------------- |
| `tool-config.ts`  | `ToolConfig` interface, `getToolConfig()`, `originalToolToName`, `ALL_TOOL_NAMES` |
| `breadcrumbs.tsx` | `useBreadcrumb` hook                                                              |
| `electron.ts`     | `ElectronWindow` type, `isElectron` helper                                        |
| `project-icon.ts` | Project icon helpers                                                              |

**Rule:** if you find yourself copy-pasting a constant or helper into a second route file, extract it to `lib/` first.

## Route Hooks (`apps/ui/src/hooks/`)

Each page route should delegate its data-fetching and derived state to a dedicated hook in `apps/ui/src/hooks/`:

```
hooks/
  use-home.ts          # useHomeData()
  use-projects.ts      # useProjects(), etc.
  use-project-detail.ts
  use-skill-library.ts # useSkills(), useAvailableTags(), useCreateSkill()
  use-skill-detail.ts
```

Route components import from `@/hooks/use-<page>` and call `useQuery` / `useMutation` only inside hooks, never directly in route components.

## Testing

Write tests for new functionality.

## Commits

One logical change per commit.

## Pre-commit Checklist

```bash
pnpm typecheck
pnpm lint
pnpm format
pnpm knip
```

## Unused Code

Run `pnpm knip` to detect unused files, exports, and dependencies across the monorepo. Configuration lives in `knip.json` at the project root with per-workspace entry points and ignore patterns.
