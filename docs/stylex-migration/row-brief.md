# Row brief (per-row agent protocol)

Each remaining row of `stylex-migration-plan.md` is implemented by one agent in its own git
worktree under `../SkillForge-wt/pr-XX` (branch `pr-XX`), on its own `VISUAL_PORT`, and merged
by the orchestrator afterwards. Stay strictly inside your row's files.

## Read (targeted)
1. `docs/stylex-migration-plan.md`: "Non-negotiable migration rules" and your row.
2. `docs/stylex-migration/conventions.md`: the headings, then fully: Toolchain, Tokens, Selector
   mapping, Component pattern (className bridge + `sx` prop), layer order beats specificity /
   foreign-element rules, "A caller's utility also shadows…", whole-property merging, Value
   traps (logical vs physical padding, paired line-heights as lengths), Animations, Tailwind
   scanner traps, "Gallery cases are append-only", the priority/tie table.
3. `docs/stylex-migration/tailwind-values.md`: grep it for every utility you translate; never
   write a value from memory. Shadow colours in `rgb(0 0 0 / 0.1)` form, never hex.
4. One precedent: `docs/stylex-migration/pr-12.md` (notes format) and a migrated component
   similar to yours (`dialog.tsx`, `popover.tsx`, `dropdown-menu.tsx` when present, else
   `card.tsx`, `switch.tsx`, `button.tsx`), plus `apps/ui/src/lib/sx.ts`,
   `apps/ui/src/styles/tokens.stylex.ts`.
5. `docs/visual-testing.md` and the spec that covers your components.

## Do
1. Inventory the exact classes in your files. Add missing states as gallery cases in a NEW
   section named after your row (given in your task), with one distinctive token in every new
   test name so `-g <token>` selects exactly them. Register the section at the END of
   `src/visual-gallery/sections/index.ts` and the END of `SECTIONS` in `visual/gallery.spec.ts`;
   overlay/animation/computed-style cases go in new blocks appended at the END of the spec.
2. Capture the new originals BEFORE editing any component of your row, while it is still
   Tailwind on your clean base: `VISUAL_PORT=<port> pnpm exec playwright test
   --update-snapshots=missing --workers=3 -g <token>` from `apps/ui`. Newly written snapshots are
   reported as failures ("A snapshot doesn't exist … writing actual"); rerun the same filter and
   it must pass. `git status` must show only new originals. If a row file was already edited,
   use `apps/ui/visual/frozen-originals.sh <checkout-root> <port> '<filter>'` instead (plain-copy
   swap of the ee0f797 sources, missing originals only, restores your files).
3. Migrate: `stylex.create` + `cn(sx.className, className)` bridge; `style` merged only when
   present; identical DOM, attributes, refs, defaults, spread order, variant names. Rules that
   style caller-provided children (`[&_svg]`, `[&>a]`, `*:` on foreign elements) STAY Tailwind
   classes in a named `const` with a comment naming the removing PR (usually PR 32). `hover:` →
   `'@media (hover: hover)': { ':hover': … }`. `data-open:`/`data-closed:` → the compiled
   `:is(:where(…), :where(…))` shape. Runtime inline styles stay inline. Keep exported cva helpers
   other files import byte-identical; list their callers. Comments must name the full original
   class: a bare utility or a `--animate-*` name in a comment leaks into the built CSS.
4. Gates (output to log files, grepped): `rm -rf apps/ui/visual/results apps/ui/visual/report`;
   `pnpm typecheck && pnpm lint && pnpm format && pnpm knip`; `pnpm --filter @skillforge/ui build`
   with and without `VITE_VISUAL_GALLERY=true`; the built CSS's Tailwind portion versus a build
   of your base must add nothing (only utilities used by new gallery cases may appear); the dev
   suite ONCE, one spec file per foreground command (`VISUAL_PORT=<port> pnpm exec playwright test
   visual/<spec> --workers=3`), zero diffs; the production pass ONCE (`VISUAL_BUILD=1 …`) in the
   background with a log; `visual:check-originals` right after a suite run; `visual:check-gallery`.
   A diff against an existing original means the translation is wrong: open the diff PNG and the
   computed-style JSON, fix, rerun. Never refresh an original, never widen a tolerance. `route *
   error` and animation-frame cases can time out under machine load; rerun them once in isolation.
5. Live check, scoped: dev server on your port with `VITE_VISUAL_GALLERY=true`, headless Chromium
   with console/pageerror/requestfailed listeners; exercise the row's interactions on your gallery
   section and on one real route that mounts the component.
6. Notes: `docs/stylex-migration/pr-XX.md` (≤ 120 lines): touched files, new cases, baseline
   `ee0f797`, Chromium build (from `apps/ui/visual/ORIGINALS.md`), bridge Tailwind leftovers
   (file → removing PR), kept cva helpers and callers, commands, observations, pre-existing
   defects seen (never fixed), and "Findings for conventions.md". Do NOT edit `conventions.md`.
7. ONE commit with the given message. No AI attribution trailers. No push, no amend, never
   commit `data.db`, never touch files outside your row except the registration lines, specs,
   originals and your notes file.

## Hard limits (a background agent whose tool call shows no progress for 10 minutes is killed,
## and one that triggers a permission prompt waits forever)
- Every foreground command under ~5 minutes. Long runs go in the background with a log file.
- Never `git checkout`, `git stash`, `git reset`, `git clean`; never `rm -rf` anything except
  `apps/ui/visual/results` and `apps/ui/visual/report`; never write shell scripts; never
  `cp -R` a tree; never `kill` by pattern (`lsof -ti:<port> | xargs kill` for your own server).
- Back up uncommitted work with `git diff > <scratch>/pr-XX.patch`, never by copying the tree.
- Never `cat` a whole large file; use `grep -n` and line ranges.
