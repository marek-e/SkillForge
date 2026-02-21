---
description: Run format, lint, and typecheck in parallel, then fix issues until all green
disable-model-invocation: true
---

Run QA checks in this order. Do NOT run them in parallel — `pnpm format` auto-fixes files in place, so it must complete before `pnpm lint` and `pnpm typecheck` run.

1. `pnpm format` — applies formatting fixes in place
2. `pnpm lint` — fix all lint errors
3. `pnpm typecheck` — fix all type errors
4. After fixing anything in steps 2–3, re-run `pnpm format` to ensure the fixes are formatted

Then fix all issues found. When all are fixed, re-run all the above in the same order. Repeat until all pass cleanly (exit 0 with no changes).
