---
description: Run format, lint, and typecheck in parallel, then fix issues until all green
disable-model-invocation: true
---

Run 3 QA subagents in parallel. These subagents do nothing else than executing the command, they don't perform any other tool call to investigate more.

1. `pnpm format`
2. `pnpm lint`
3. `pnpm typecheck`

Then fix all issues.

When all is fixed, re-run all the above. Repeat until all is green.
