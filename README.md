<div align="center">
  <a href="https://raw.githubusercontent.com/marek-e/SkillForge/refs/heads/main/apps/ui/public/anvil.svg">
    <img width="180" src="https://raw.githubusercontent.com/marek-e/SkillForge/refs/heads/main/apps/ui/public/anvil.svg" alt="SkillForge Logo" />
  </a>
</div>
<br />

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
pnpm web:dev        # Starts runtime (:4321) and UI (:4320)
pnpm electron:dev   # Run as desktop app (Electron)
```

Open http://localhost:4320 to see the web dashboard, or use `electron:dev` for the desktop app.

## Supported Tools

- **Cursor** — Full import/export support
- **Claude Code** — Full import/export support
- More connectors coming (OpenAI/Codex, Gemini)

## Project Structure

```
apps/
  ui/           # Vite + React frontend
  runtime/      # Node.js local runtime (localhost API)
  electron/     # Electron desktop wrapper
packages/
  core/         # Canonical models and shared logic
  connectors/   # Per-tool adapters
```

## Development

```bash
# Web app mode
pnpm web:dev                            # Runtime + UI (:4321, :4320)

# Desktop app mode
pnpm electron:dev                       # UI + Electron

# Individual services
pnpm --filter @skillforge/runtime dev   # Runtime only (:4321)
pnpm --filter @skillforge/ui dev        # UI only (:4320)
pnpm --filter @skillforge/electron dev  # Electron only (requires UI running)

# Code quality
pnpm typecheck                          # Type checking
pnpm lint                               # Linting
pnpm format                             # Code formatting

# Build for distribution
pnpm electron:build                     # Build Electron app (dmg/nsis/AppImage)
```

## Contributing

Contributions welcome! Please run `pnpm typecheck` before submitting PRs. See `CLAUDE.md` for architecture details and code quality expectations.

## License

[MIT](LICENSE)
