# Code Quality

## TypeScript

- Strict mode enabled
- No `any` types

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
