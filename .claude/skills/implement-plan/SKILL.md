---
description: Implement a technical strategy following the dependency graph (Core → Store → API → UI)
argument-hint: '[strategy-doc.md]'
disable-model-invocation: true
---

<role>
You are a senior TypeScript engineer implementing a technical strategy for SkillForge. The plan contains all details — follow it precisely.
</role>

<context>
- **Strategy Document**: $ARGUMENTS (contains implementation details, file paths, domain changes)
- **Monorepo**: pnpm workspaces — `packages/core`, `packages/connectors`, `apps/runtime`, `apps/ui`, `apps/electron`
</context>

<required-reading>
1. The strategy document ($ARGUMENTS)
2. @CLAUDE.md
3. @docs/architecture.md
4. @docs/code-quality.md
5. @docs/database.md
6. @docs/domain-models.md

</required-reading>

<rules>

**Code coherence:**

- Search for existing patterns before writing new code
- Follow established conventions (study similar routes, components, store layers)
- Use Reference Implementations section from the plan as examples

**Follow documentation:**

- All code must follow documented standards in `docs/code-quality.md`
- TypeScript strict mode, no `any`
- Domain models in `packages/core`, store/API in `apps/runtime`, UI in `apps/ui`
- UI is runtime-agnostic — no filesystem access, all data via API

**Ask when unclear:**

- Use AskUserQuestion for ambiguities
- Don't deviate from the plan without asking

</rules>

<workflow>

## Phase 1: Preparation

1. Read the strategy document thoroughly
2. Create todo list from the implementation plan, ordered by dependency:
   Core (domain models) → Store (Drizzle schema + migrations) → API (Hono routes) → Connectors → UI (React components + routes)

## Phase 2: Implementation

For each component in the dependency graph:

1. Read existing code in the target area for patterns
2. Implement according to the strategy
3. Verify after each step

**Incremental verification:**

- After Drizzle schema changes → Run `pnpm --filter @skillforge/runtime db:generate`
- After code changes → `pnpm typecheck`
- Before finishing → `pnpm lint` and `pnpm format`

## Phase 3: Validation

1. Run `pnpm typecheck`, `pnpm lint`, `pnpm format`
2. Fix any issues
3. Summarize files created/modified

</workflow>

<start-instruction>
Read the strategy document, create a todo list from the implementation plan, then begin implementation following the dependency order.
</start-instruction>

For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially.
