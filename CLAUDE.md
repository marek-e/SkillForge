# CLAUDE.md

SkillForge is a local-first tool to visualize and manage agent skills across agentic tools (Cursor, Claude Code, etc.).

## Essentials

- **Package manager:** pnpm
- **Web dev server:** `pnpm web:dev` (runtime :4321, UI :4320)
- **Electron dev:** `pnpm electron:dev` (UI :4320, Electron app)
- **Type check:** `pnpm typecheck` (run before committing)
- **Lint:** `pnpm lint` (run before committing)
- **Format:** `pnpm format` (run before committing)

## Dependencies

- to add a new dependency, run `pnpm add <package>` never update manually the package.json so it always use the latest version of the package.

## Detailed Docs

- [Architecture](docs/architecture.md) — Monorepo structure, tech stack, constraints
- [Architecture Diagram](docs/architecture-diagram.md) — Visual dependency graph
- [UI Components](docs/ui-components.md) — Component library reference
- [Domain Models](docs/domain-models.md) — Agent and Skill schemas
- [Connectors](docs/connectors.md) — How to build tool adapters
- [Code Quality](docs/code-quality.md) — TypeScript rules, testing, commits
- [Ralph Wiggum](docs/ralph-wiggum.md) — Autonomous coding loop pattern
