# Visual testing

The visual regression suite is the release gate for the [StyleX migration](stylex-migration-plan.md). It compares the rendered UI against **frozen original screenshots** captured at the pre-migration commit. Every migration PR runs the whole suite against those same originals.

## Commands

```bash
pnpm visual                                     # run the suite (dev server)
pnpm --filter @skillforge/ui visual:build       # run the suite against the production build
pnpm visual:report                              # open the HTML report of the last run
pnpm --filter @skillforge/ui visual:check-originals   # fail on failure artifacts or orphan originals
pnpm --filter @skillforge/ui visual:check-gallery     # fail if gallery code reaches the shipped bundle
```

The suite starts its own Vite server on port 4320 (override with `VISUAL_PORT=<port>` to run several checkouts side by side) with `VITE_VISUAL_GALLERY=true`. No runtime server is needed: every API call is served from fixtures.

## The one rule

**Never refresh an original to make a comparison pass.**

When a comparison fails, open the diff image from `apps/ui/visual/results/` (or `pnpm visual:report`) and find out why the pixels moved. A migration PR that changes a rendered pixel is wrong by definition, because the migration only moves styling from Tailwind to StyleX.

An original may only be replaced when the original itself is broken, and then only in a dedicated PR against the frozen app, reviewed on its own.

`visual:update` exists solely to create an original for a **new** case. It runs `--update-snapshots=missing`, which writes missing originals and never overwrites an existing one. CI never passes `--update-snapshots` in any form.

## What is frozen

| File                             | Covers                                                                                                                                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `visual/routes.spec.ts`          | All eight routes × light/dark × populated/empty/loading/error, plus the not-found route, the sidebar toggle, grid display mode, custom editor settings and reduced motion                                   |
| `visual/gallery.spec.ts`         | Every section of the test-only gallery, each case as an element screenshot, plus hover/focus/active/open interaction states                                                                                 |
| `visual/overlays.spec.ts`        | Portal placement for dialog, alert dialog, sheet (4 sides), drawer, popover, tooltip, hover card, dropdown, context menu, menubar, navigation menu, select, combobox, submenus and every application dialog |
| `visual/animations.spec.ts`      | Overlay and accordion enter animations at 0 ms, 100 ms and 200 ms                                                                                                                                           |
| `visual/computed-styles.spec.ts` | JSON snapshots of computed values and bounding boxes for body, sidebar, header, main, buttons, inputs, cards, badges, separators and headings                                                               |
| `visual/electron.spec.ts`        | The Electron shell (titlebar, sidebar offset, Electron-only controls) for `darwin` and `win32`, plus an opt-in real Electron capture                                                                        |

Originals live in `apps/ui/visual/__originals__/{project}/{spec file}/{name}.png`. There is no platform suffix: see [ORIGINALS.md](../apps/ui/visual/ORIGINALS.md) for the machine they were captured on.

## Determinism

Anything that can move a pixel is pinned:

- **Browser**: Chromium only, pinned through the exact `@playwright/test` version in `apps/ui/package.json`.
- **Viewports**: `desktop` 1440×900 and `mobile` 390×844, `deviceScaleFactor: 1`, `scale: 'css'`.
- **Locale and timezone**: `en-US`, `UTC`.
- **Theme**: `localStorage.theme` is written before the app boots and `prefers-color-scheme` is emulated to match, so `next-themes` never falls back to the system value.
- **Clock**: `page.clock.setFixedTime('2025-06-01T12:00:00Z')`. Timers keep running, which matters because TanStack Query, Radix and vaul all depend on them.
- **Randomness**: `Math.random` is replaced with a constant. `SidebarMenuSkeleton` randomises its bar width, which would otherwise differ on every run. A constant rather than a seeded sequence, because React's StrictMode double-invokes state initialisers in development but not in production, so a sequence would advance a different number of times in `pnpm visual` and in `VISUAL_BUILD=1 pnpm visual`.
- **Data**: `visual/fixtures/<mode>/*.json` with stable ids (`skill-alpha`, `project-alpha`) and stable dates (`2025-01-15T10:00:00.000Z`).
- **Settings**: the `skillforge:*` localStorage keys and the `sidebar_state` cookie are written before boot.
- **Waits**: fonts (`document.fonts.ready`), network idle, a stable selector, and a scroll reset of the inner scroll container before every capture.
- **Rasterisation**: Chromium is launched with `--disable-partial-raster`, `--num-raster-threads=1`, `--disable-skia-runtime-opts`, `--disable-checker-imaging`, `--disable-threaded-animation`, `--force-color-profile=srgb`, `--font-render-hinting=none`, `--disable-lcd-text` and friends. Without them, rounded corners, CSS `filter` (the `dark:invert` tool logos) and composited overlays differ by a few pixels run to run.
- **Comparison**: `maxDiffPixels: 0`, `threshold: 0`. No masks, no tolerance.

Every case must be deterministic on its own. `retries` is 0 on purpose: a flaky case is a bug in the case, not something to retry away.

## Data modes

`gotoRoute(page, path, { data })` picks how the mocked runtime behaves:

- `populated` — the full fixture set.
- `empty` — empty lists; detail routes still resolve so their empty sub-states render.
- `loading` — requests are never fulfilled, so skeletons stay on screen.
- `error` — every request returns 500. TanStack Query retries three times with a 1 s/2 s/4 s backoff, so the helper waits until the mocked API has been quiet for eight seconds before capturing, which is wider than the longest retry gap.

## Animations

CSS animations run on the compositor clock, which `page.clock` does not control. Fixed-frame capture therefore works like this:

1. `installAnimationFreeze` injects `animation-play-state: paused !important` **before** the overlay opens, so the enter animation never advances on its own.
2. `freezeAnimationsAt(page, ms)` pauses every entry from `document.getAnimations()` and seeks it to the requested time.
3. The screenshot is taken with `animations: 'allow'` so Playwright does not fast-forward it.

Everywhere else, screenshots use `animations: 'disabled'`, which parks infinite animations on their first frame and finishes finite ones. JavaScript-driven motion (Embla, vaul) is handled by `waitForStable`, which waits until an element's box and transform have not changed for five consecutive polls.

## Dev server versus production build

`pnpm visual` runs against `vite` in dev. `VISUAL_BUILD=1 pnpm visual` runs `vite build && vite preview` and compares against **the same originals**. Running both is what catches a plugin-ordering or CSS-emission difference between the two pipelines, which is the exact risk the StyleX unplugin introduces in PR 01.

## The test-only gallery

`apps/ui/src/visual-gallery/` renders every SkillForge-owned component in states the routes never mount. It is mounted at `/__gallery/$section` **only** when `VITE_VISUAL_GALLERY=true`.

Vite replaces the flag with a literal at build time, so without it the route factory is unreachable, Rollup drops it together with its dynamic import, and no gallery chunk is emitted. `visual:check-gallery` proves that by building without the flag and grepping `dist` for `data-gallery-section`, `data-gallery-case` and `gallery /`.

Each case is wrapped in `<div data-gallery-case="name">`. `gallery.spec.ts` reads those names from the DOM, so a case added in a later PR immediately needs an original instead of going silently uncovered. Cases named `quirk-*` record a pre-existing oddity that the migration must preserve, not fix.

## Electron

Two layers:

1. **Electron shell in Chromium** (always runs). `window.electronAPI` is installed by an init script before the app boots. `lib/electron.ts` reads it at module scope, so the UI takes every Electron branch: the custom titlebar, the `.electron-app` sidebar offset rules and the Electron-only project actions. Both `darwin` and `win32` are captured, which covers the traffic-light spacer and the custom window controls.
2. **Real Electron host** (opt-in, `VISUAL_ELECTRON=1`). `apps/electron/src/main.ts` boots the embedded runtime before it opens the window, so this needs `pnpm --filter @skillforge/electron build` and a `better-sqlite3` rebuilt against the Electron ABI (`pnpm --filter @skillforge/electron rebuild-sqlite`). That is machine-specific and would also put real local data on screen, so it is skipped by default:

   ```bash
   pnpm --filter @skillforge/electron rebuild-sqlite
   pnpm --filter @skillforge/electron build
   VISUAL_ELECTRON=1 pnpm visual
   ```

Live Electron behaviour that no screenshot can prove — drag regions, native window controls, traffic-light clearance — is checked by hand with `pnpm electron:dev` on every PR that touches shared layout, themes, overlays or desktop behaviour.

## CI

The `visual` job runs on the Apple silicon `macos-26` runner, matching the macOS 26 / Darwin 25 family recorded for the originals. Font rasterisation can still differ across OS patch versions; CI must verify the frozen images without refreshing them. It installs the pinned Chromium, runs the suite, runs `visual:check-originals` (which fails on any `-actual`/`-diff` artifact and on any original no test claimed), runs `visual:check-gallery`, and uploads `visual/results` and the HTML report as artifacts on failure.
