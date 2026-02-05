# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SkillForge is a local-first developer tool to visualize, manage, and normalize agent skills across multiple agentic tools (Cursor, Claude Code, OpenAI/Codex, Gemini, etc.). It is a configuration inspector, skill registry/editor, and portability/diff tool—NOT an agent runner or cloud service.

## Architecture

Monorepo using pnpm workspaces:
- `apps/ui/` — Vite + React frontend (NO filesystem access)
- `apps/runtime/` — Node.js 20 local runtime (Hono or Fastify)
- `packages/core/` — Canonical models and shared logic
- `packages/connectors/` — Per-tool adapters (Cursor, Claude Code, etc.)

### Technology Stack

**UI:** Vite, React, TypeScript, TanStack Router, TanStack Query, Tailwind CSS, Monaco Editor

**Runtime:** Node.js 20, TypeScript, Hono or Fastify, Zod, chokidar

## Key Architectural Constraints

1. **Canonical model is sacred** — All tool configurations normalize to one internal schema. No tool-specific logic in the UI.
2. **UI is runtime-agnostic** — Must work as web app now and in Electron later without rewrites.
3. **UI has no filesystem access** — All file operations go through the runtime's localhost HTTP/JSON API.
4. **Import/export flow:**
   - Import: tool format → canonical model (may be lossy, show warnings)
   - Export: canonical model → tool format

## Core Domain Models

### Agent
Represents a tool-specific agent configuration:
- `id`, `name`, `sourceTool` (cursor | claude | openai | gemini | generic), `enabledSkills: SkillRef[]`

### Skill
A semantic capability an agent can invoke (configuration, not execution logic):
- `id`, `name`, `description` (LLM-facing), `inputSchema` (Zod/JSON Schema), `outputSchema` (optional)
- `implementationRef` (file/command/API), `source` (manual | imported), `originalTool` (if imported)

## Connectors

Each connector must:
1. Locate tool config files
2. Parse them
3. Normalize to canonical model
4. Export back (best-effort)

Priority: Cursor first, then Claude Code.

## Design Principles

- Local-first
- Transparency over magic
- Fewer skills → smarter agents (reduce context/token bloat)
- No framework lock-in

---

## Ralph Wiggum Mode

This repo supports Ralph Wiggum - an autonomous AI coding loop pattern. See `docs/ralph-wiggum.md` for full documentation.

### Quick Start

```bash
# HITL (human-in-the-loop) - watch and intervene
./ralph-once.sh

# AFK (away from keyboard) - autonomous
./ralph.sh 5    # Run 5 iterations
```

### Files

| File | Purpose |
|------|---------|
| `ralph.sh` | AFK loop - runs N iterations autonomously |
| `ralph-once.sh` | HITL mode - single iteration with human oversight |
| `prd.json` | Product requirements with prioritized tasks |
| `progress.txt` | Session progress log (delete between sprints) |

---

## Code Quality Expectations

- **TypeScript**: Strict mode, no `any` types
- **Tests**: Write tests for new functionality
- **Small commits**: One logical change per commit
- **Feedback loops**: Run `pnpm typecheck` before committing
- Leave the codebase better than you found it
