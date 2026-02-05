# Domain Models

## Agent

Represents a tool-specific agent configuration.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Display name |
| `sourceTool` | enum | `cursor` \| `claude` \| `openai` \| `gemini` \| `generic` |
| `enabledSkills` | SkillRef[] | References to enabled skills |

## Skill

A semantic capability an agent can invoke. This is configuration, not execution logic.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Display name |
| `description` | string | LLM-facing description |
| `inputSchema` | Zod/JSON Schema | Input validation schema |
| `outputSchema` | Zod/JSON Schema? | Optional output schema |
| `implementationRef` | string | File, command, or API reference |
| `source` | enum | `manual` \| `imported` |
| `originalTool` | string? | Source tool if imported |
