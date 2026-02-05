# SkillForge

## Product overview

SkillForge is a local-first developer tool to visualize, manage, and normalize agent skills across multiple agentic tools (Cursor, Claude Code, OpenAI/Codex, Gemini, etc.).

It is NOT:
	•	an agent runner
	•	a prompt playground
	•	a cloud service

It IS:
	•	a configuration inspector
	•	a skill registry + editor
	•	a portability & diff tool

Target user: developer working with agentic tools locally.

⸻

Core goals
	•	Single source of truth for agent skills
	•	Make invisible agent configs visible
	•	Reduce context/token bloat by controlling exposed skills
	•	Enable reuse and portability of skills across tools

⸻

## Key concepts

### Agent

An Agent represents a tool-specific agent configuration.

Fields:
	•	id
	•	name
	•	sourceTool (cursor | claude | openai | gemini | generic)
	•	enabledSkills: SkillRef[]

⸻

### Skill

A Skill is a semantic capability an agent can invoke.

Fields:
	•	id
	•	name
	•	description (LLM-facing)
	•	inputSchema (Zod / JSON Schema)
	•	outputSchema (optional)
	•	implementationRef (file / command / API)
	•	source (manual | imported)
	•	originalTool (if imported)

Skills are configuration, not execution logic.

⸻

## Canonical internal model

All tools are normalized into one internal schema.
Import = tool format → canonical model
Export = canonical model → tool format

No tool-specific logic leaks into the UI.

⸻

## Architecture

Monorepo (pnpm workspaces)
```
apps/
  ui/        # Vite + React
  runtime/   # Node.js local runtime
packages/
  core/      # canonical models + logic
  connectors/# per-tool adapters
```

UI
	•	Vite + React + TypeScript
	•	TanStack Router
	•	TanStack Query
	•	Tailwind CSS
	•	Monaco Editor (schemas, prompts, diff)

Responsibilities:
	•	visualize agents & skills
	•	edit skills
	•	enable/disable skills per agent
	•	show diffs
	•	show token cost estimation per agent

NO filesystem access.

⸻

Local runtime (not a backend)
	•	Node.js 20 + TypeScript
	•	Hono or Fastify
	•	Zod
	•	chokidar

Responsibilities:
	•	filesystem access
	•	detect tool config locations
	•	import configs via connectors
	•	normalize into canonical model
	•	watch config changes
	•	export back to tool formats

API exposed on localhost (HTTP, JSON).

⸻

Connectors

Each connector:
	•	locates tool configs
	•	parses them
	•	normalizes → canonical model
	•	exports back (best-effort)

Initial priority:
	1.	Cursor
	2.	Claude Code

Imports may be lossy → UI must show warnings.

⸻

Core features (v1)
	•	List agents (per tool)
	•	List all skills
	•	See which agent sees which skill
	•	Enable / disable skills per agent
	•	Create skill from template
	•	Duplicate skill
	•	Edit skill description & schema
	•	Import from tool configs
	•	Export back with preview
	•	Show estimated token cost per agent

⸻

Non-goals (v1)
	•	Executing agents
	•	Running skills
	•	Auth / secrets
	•	Cloud sync
	•	Marketplace
	•	AI-assisted editing

⸻

Electron plan
	•	Start as local web app (Vite + Node runtime)
	•	Later:
	•	runtime → Electron main
	•	UI unchanged
	•	optional IPC optimization

Architecture must keep UI runtime-agnostic.

⸻

Design principles
	•	Local-first
	•	Transparency over magic
	•	Fewer skills → smarter agents
	•	Canonical model is sacred
	•	No framework lock-in

⸻

Naming

App name: SkillForge
Positioning: “Forge, inspect, and control agent skills across tools.”

⸻

Success criteria
	•	Developer can understand agent skill exposure at a glance
	•	Skill duplication across tools is trivial
	•	Token/context waste becomes visible
	•	Adding Electron later requires no rewrite
