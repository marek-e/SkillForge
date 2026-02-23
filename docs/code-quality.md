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

Each page route should delegate its data-fetching and form state to dedicated hooks in `apps/ui/src/hooks/`:

```
hooks/
  use-home.ts               # useHomeData()
  use-projects.ts           # useProjects(), etc.
  use-project-detail.ts
  use-skill-library.ts      # useSkills(), useAvailableTags(), useCreateSkill()
  use-skill-detail.ts       # useSkill(), useSkillDirectory(), mutations
  use-skill-detail-form.ts  # useSkillDetailForm() — draft state + handleSave
```

Two kinds of hooks:

- **Data hooks** (`use-<page>.ts`) — `useQuery` / `useMutation` calls, query invalidation, navigation after mutations. Never called directly in route components.
- **Form hooks** (`use-<page>-form.ts`) — draft state, `hasChanges`, `isSaving`, `handleSave`. Receive the loaded entity as a prop so state initializes directly from it — no `useEffect` needed.

**Rule:** `useQuery` and `useMutation` are only called inside hooks, never directly in route components.

## Route Component Structure

Every detail/edit page follows a two-component pattern:

```tsx
// 1. Page — fetches data, owns loading/empty state, breadcrumb
function SkillDetailPage() {
  const { data: skill, isLoading } = useSkill(skillId)
  useBreadcrumb(...)
  if (isLoading) return <Skeleton />
  if (!skill) return null
  return <SkillDetailForm skill={skill} skillId={skillId} />
}

// 2. Form — receives loaded data as props, owns editing state
function SkillDetailForm({ skill, skillId }: { skill: Skill; skillId: string }) {
  const form = useSkillDetailForm(skill, skillId)
  // ...render
}
```

This avoids the need to sync server data into local state with `useEffect`. State is initialized once from props when the form mounts — React guarantees this runs only once.

**Anti-pattern to avoid:**

```tsx
// ❌ Never do this — syncing server data with useEffect
const [nameDraft, setNameDraft] = useState('')
useEffect(() => {
  if (skill) setNameDraft(skill.name)
}, [skill])

// ✅ Instead, gate on data in the parent and initialize from props
const [nameDraft, setNameDraft] = useState(skill.name)
```

## Caching Async Data Without `useEffect`

When a child component fetches data on demand (e.g. a file opened by the user) and the parent needs the original value for change detection, use a `ref` updated during render instead of `useState` + `useEffect`:

```tsx
const loadedFileContentsRef = useRef<Record<string, string>>({})
const { data: fileData } = useSkillFile(skillId, selectedFile)

// Safe: write-once before any read in the same render
if (
  selectedFile &&
  fileData?.content !== undefined &&
  !(selectedFile in loadedFileContentsRef.current)
) {
  loadedFileContentsRef.current[selectedFile] = fileData.content
}
```

Pass the ref as a prop (`{ current: Record<string, string> }`) to child components that need to populate it.

## Component Extraction

Extract a route section into its own file in `components/skills/` when it:

- Has its own local state (e.g. expand/collapse, selected item)
- Has its own data query
- Is long enough to obscure the overall page structure

Private helpers (e.g. `getFileIcon`) stay in the component file — do not export them.

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
