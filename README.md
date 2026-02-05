# SkillForge

Forge, inspect, and control agent skills across tools.

SkillForge is a local-first developer tool that makes invisible agent configurations visible. It normalizes skill definitions across agentic tools (Cursor, Claude Code, and more), letting you manage what each agent can do from a single interface.

## Features

- **Unified skill registry** — View and edit skills from multiple tools in one place
- **Agent visibility** — See exactly which skills each agent has access to
- **Enable/disable skills** — Control context bloat by toggling skills per agent
- **Import/export** — Bring in existing configs, export back to tool formats
- **Token cost estimation** — Understand the context cost of your skill configurations
- **Diff view** — Compare skill definitions across tools
- **Local-first** — Your data stays on your machine, no cloud required

## Quick Start

**Prerequisites:** Node.js 20+, pnpm

```bash
pnpm install
pnpm dev          # Starts runtime (:4321) and UI (:4320)
```

Open http://localhost:4320 to see the dashboard.

## Supported Tools

- **Cursor** — Full import/export support
- **Claude Code** — Full import/export support
- More connectors coming (OpenAI/Codex, Gemini)

## Project Structure

```
apps/
  ui/           # Vite + React frontend
  runtime/      # Node.js local runtime (localhost API)
packages/
  core/         # Canonical models and shared logic
  connectors/   # Per-tool adapters
```

## Development

```bash
# Run both services
pnpm dev

# Individual services
pnpm --filter @skillforge/runtime dev   # Runtime only (:4321)
pnpm --filter @skillforge/ui dev        # UI only (:4320)

# Type checking
pnpm typecheck
```

## Contributing

Contributions welcome! Please run `pnpm typecheck` before submitting PRs. See `CLAUDE.md` for architecture details and code quality expectations.

## License

MIT
