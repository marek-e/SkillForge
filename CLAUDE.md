# CLAUDE.md

SkillForge is a local-first tool to visualize and manage agent skills across agentic tools (Cursor, Claude Code, etc.).

## Essentials

- **Package manager:** pnpm
- **Dev server:** `pnpm dev` (runtime :4321, UI :4320)
- **Type check:** `pnpm typecheck` (run before committing)
- **Lint:** `pnpm lint` (run before committing, when available)

## Detailed Docs

- [Architecture](docs/architecture.md) — Monorepo structure, tech stack, constraints
- [Domain Models](docs/domain-models.md) — Agent and Skill schemas
- [Connectors](docs/connectors.md) — How to build tool adapters
- [Code Quality](docs/code-quality.md) — TypeScript rules, testing, commits
- [Ralph Wiggum](docs/ralph-wiggum.md) — Autonomous coding loop pattern
