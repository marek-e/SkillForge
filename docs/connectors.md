# Connectors

Connectors are adapters that bridge external tool configurations with SkillForge's canonical model.

## Connector Requirements

Each connector must:

1. **Locate** — Find tool config files on the filesystem
2. **Parse** — Read and validate the tool's format
3. **Normalize** — Convert to canonical model
4. **Export** — Convert back to tool format (best-effort)

## Implementation Priority

1. Cursor
2. Claude Code
3. OpenAI/Codex (planned)
4. Gemini (planned)

## Handling Lossy Imports

Imports may lose information when the source format has features the canonical model doesn't support. When this happens, the UI must show warnings to the user.
