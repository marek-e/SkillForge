# StyleX migration plan

## Goal and boundary

Move all SkillForge-owned UI styling in `apps/ui` from Tailwind, `cva`, and `cn` to StyleX while preserving the rendered UI and behavior at the frozen pre-migration commit. Preserve visible defects and odd interactions. File a separate issue for any discovered bug; do not fix it in a migration PR.

This includes the 50 files in `src/components/ui`, 12 typography files, application components, all eight page routes, the root layout, themes, animations, responsive states, and Electron styling. The starting tree has one global stylesheet, 94 TSX files with class-based styling, and no visual regression suite. `data.db` is untracked local data and is outside this work.

The target is zero pixel differences for a defined, deterministic screenshot matrix, plus unchanged DOM behavior and interactions. No finite test matrix can prove every possible runtime state is identical. The matrix below defines the release gate; any difference outside it that appears during review also blocks the PR until understood.

## Non-negotiable migration rules

1. Freeze a pre-migration commit and its test data. Keep its screenshots read-only throughout the series. Never approve a changed screenshot simply because the new styling looks better.
2. Migrate styling only. Preserve DOM structure, component props, forwarded refs, `data-*` and ARIA attributes, focus order, state transitions, timers, and current bugs. Record any unavoidable DOM change and prove the rendered and interaction output remains identical.
3. Use the official `@stylexjs/unplugin` Vite integration before React in the plugin list. Keep Tailwind active until the last consumer has migrated. Test both Vite development and production output before removing it.
4. Preserve existing CSS values exactly, including `oklch` values, font files, radii, breakpoints, spacing, shadows, easing, focus rings, animations, and dark mode behavior. Do not substitute a new design scale. Map the existing `:root` and `.dark` tokens to StyleX variables in a dedicated PR. Keep `next-themes` and its `.dark` class behavior.
5. StyleX styles apply at the element that receives `stylex.props`. During coexistence, keep a measured `className` bridge for callers still using Tailwind. Preserve the current `className` override behavior, including `twMerge` effects. Move callers to StyleX styles before deleting that bridge. Do not blindly concatenate atomic and utility classes and assume precedence is unchanged.
6. Convert `cva` variants to explicit StyleX styles without changing variant or size names. Check exported variant helpers and every call site before removing them. Keep runtime values, such as table widths, progress transforms, and sidebar sizes, at the same computed values.
7. Preserve CSS that must remain global, such as the font-face imports and exact reset rules, in a minimal stylesheet. Remove Tailwind generation only after matching its computed base styles. No new owned component or page styles should remain in global CSS at the end.

## Visual and live verification contract for every PR

Each PR description must name its touched files, screenshot cases, original baseline commit, browser build, and any observed pre-existing defect. Each PR adds or extends executable visual tests for its changed states and runs the full existing suite against the *same frozen original* images. CI must reject missing images, new images without an original counterpart, and any pixel difference. Reviewers inspect the diff image when a comparison fails; they do not raise a tolerance or refresh the original image to make it pass.

Run screenshots with the same pinned Chromium and Electron versions, OS image, device scale factor, viewport, locale, timezone, color scheme, font files, and fixture data. Wait for fonts and data to settle. Freeze dates and animations at defined capture points. Test animations separately at fixed timestamps instead of disabling them globally. Capture full-page and element images where clipping, portals, or scrolling matter. Use exact pixel comparison in that environment and compare selected computed styles and element bounds to catch a hidden cascade change. Avoid masks; make changing content deterministic instead.

The standing matrix covers 1440×900 desktop and 390×844 mobile, light and dark themes, default/hover/focus/active/disabled/error states where applicable, open and closed overlays, loading/empty/populated data, and reduced-motion settings where they change output. Add cases for all variants of each migrated component in a test-only gallery, including components that current routes do not mount. Route fixtures cover `/`, `/tools`, `/tools/$toolId`, `/skills`, `/skills/$skillId`, `/projects`, `/projects/$projectId`, and `/settings`. Use stable fixture IDs and content. Electron cases cover titlebar, sidebar offsets, window controls, and packaged output on each supported OS in CI; at minimum run the current development host live on every relevant PR.

Every PR also has live verification. Start `pnpm web:dev`, open its changed page or gallery case in an actual browser, interact with the changed states, and inspect console and network errors. For changes affecting shared layout, themes, overlays, or desktop behavior, run `pnpm electron:dev` and exercise the same states in Electron. For every PR run `pnpm typecheck`, `pnpm lint`, and the UI production build. Record commands and observations in the PR. A screenshot test alone does not verify focus, drag regions, keyboard controls, scroll locking, or click targets.

## PR sequence

PRs merge in order. Each row specifies the additional visual cases and live checks on top of the standing contract above. Keep one row to one PR. If a row grows too large during implementation, split it by component without weakening its gate.

| PR | Change and boundary | Visual regression additions | Live verification steps |
| --- | --- | --- | --- |
| 00 | Add Playwright screenshot infrastructure, fixed API fixtures, a test-only component gallery, and immutable images from the original commit. No production styling change. Capture current quirks as named cases. | Baseline all routes, 50 UI components, 12 typography components, themes, responsive sizes, overlay portals, and Electron shell. Test the comparator by deliberately altering one fixture image and confirming failure. | Walk each route in web and Electron; open gallery controls; verify fixture data and screenshots reflect the original UI. |
| 01 | Add `@stylexjs/stylex` and official Vite unplugin with a single isolated StyleX canary. Keep Tailwind and global CSS active. Verify CSS order in dev and production. | Canary in light/dark and both viewport sizes, plus full baseline suite. | Inspect generated CSS and computed styles in dev server, production preview, and Electron; verify HMR restores canary styles. |
| 02 | Port theme tokens and body/html/base behavior with exactly matched values. Retain `.dark` switching and font imports. Migrate `drag`, `no-drag`, and Electron offset rules only when their equivalent can be attached without changing the DOM. | Theme palette and font samples, focus outlines, native form defaults, dark toggle, Electron sidebar/titlebar geometry. | Toggle light/dark/system, inspect body and form computed styles, test titlebar drag and click exclusions in Electron. |
| 03 | Migrate all 12 `components/typography/*` files. Preserve their `variant` and `className` contracts for callers. | Every heading and text variant, wrapping, paragraph spacing, inline/block code, and caller overrides. | Inspect home, detail pages, and gallery at both widths; select text and check line breaks. |
| 04 | Migrate `button`, `button-group`, `badge`, `toggle`, and `display-view-switch`. Keep `buttonVariants` usable by calendar and other callers until their migration. | All button variants/sizes and icons, loading/disabled/focus/hover, grouped edges, badges, toggle/view switch states. | Use buttons and view toggles on real pages; keyboard focus and click through group controls. |
| 05 | Migrate `input`, `textarea`, `label`, `field`, and `input-group`. | Empty/filled/placeholder/invalid/disabled/read-only fields, adornments, focus rings, long labels and error text. | Edit a skill and project form; tab through fields and trigger existing validation states. |
| 06 | Migrate `checkbox`, `radio-group`, `switch`, and `slider`. | Checked/unchecked/indeterminate, disabled, focused, dragged slider, and dark states. | Change settings and filters with pointer and keyboard; verify hit targets and state persistence. |
| 07 | Migrate `card`, `table`, `separator`, and `aspect-ratio`. | Card variants and long content, table density/column widths, separators, image aspect ratios. | Inspect projects table and cards; resize the viewport and inspect truncation and column geometry. |
| 08 | Migrate `progress`, `skeleton`, `spinner`, `empty`, `not-found`, and `alert`. | Progress values, loading frames, empty/error states, alert variants. | Open loading and empty pages; observe progress, spinner, and alert states. |
| 09 | Migrate `tabs`, `accordion`, `collapsible`, `scroll-area`, and `resizable`. | Active/inactive tabs, expanded sections, scrollbars, panel widths, keyboard focus. | Switch tabs, expand sections, scroll nested areas, and resize panels in the gallery and pages. |
| 10 | Migrate `dialog` and `alert-dialog`. | Open/closed overlays, backdrop, transitions at fixed timestamps, focus and mobile widths. | Open create/delete dialogs; test Escape, focus return, scroll lock, and outside clicks. |
| 11 | Migrate `sheet` and `drawer`. | Both edge placements, mobile breakpoints, backdrops, open/closed frames. | Open mobile sheets and drawers; drag, dismiss, and inspect body scroll behavior. |
| 12 | Migrate `popover`, `tooltip`, and `hover-card`. | Trigger/floating positions, collision edges, hover/focus/open states, shadows. | Open each from mouse and keyboard near viewport edges; verify dismissal and focus handling. |
| 13 | Migrate `dropdown-menu` and `context-menu`. | Checked items, submenus, right-click placement, collision and focus states. | Open menus by pointer and keyboard; activate and dismiss submenus. |
| 14 | Migrate `menubar` and `navigation-menu`. | Menu orientation, active item, open panels, responsive layout. | Traverse both menus with pointer and keyboard; verify focus and dismissal. |
| 15 | Migrate `select` and `combobox`. | Selected/filtered options, search chips, disabled entries, popover geometry. | Search and select options in forms; test keyboard navigation and clear actions. |
| 16 | Migrate `command` and `calendar`. | Command search/results, calendar month/day states, selected dates and popovers. | Search commands and change calendar months with pointer and keyboard. |
| 17 | Migrate `sidebar` and its internal menu variants. Do this after the other primitives it uses. Preserve `data-slot` hooks until Electron rules are ported. | Expanded/collapsed/offcanvas/inset/floating states, left/right side, desktop/mobile, hover rails, active items, Electron offset. | Toggle, resize, navigate, use the mobile sheet, test rail hit area and Electron titlebar clearance. |
| 18 | Migrate `avatar`, `breadcrumb`, and `pagination`. | Avatar fallback, breadcrumb overflow, current/disabled pagination items. | Navigate breadcrumbs and pagination; inspect avatar fallback in web and Electron. |
| 19 | Migrate `carousel` and `toaster`, plus any remaining library file found by a fresh inventory. | Carousel slide positions and controls; toast lifetime, stack, and placement. | Move carousel by drag and controls; trigger and dismiss stacked toasts. |
| 20 | Migrate `Layout`, `electron-titlebar`, `mode-toggle`, `ErrorContainer`, and `lib/breadcrumbs.tsx`. | Shell and errors on each route, theme controls, desktop and mobile Electron titlebars. | Navigate all routes, toggle theme, test native window controls and drag regions. |
| 21 | Migrate `app-sidebar/*`, `project-avatar`, and `EditorSelect`. | Active navigation, section collapse, avatars, editor selection, narrow/sidebar states. | Navigate from the sidebar, collapse sections, choose an editor, and test Electron clearance. |
| 22 | Migrate `ToolCard*` and `skill-library/*`. | Tool cards and compact cards, filters in all selected states. | Filter tools and skills; switch display modes and follow card links. |
| 23 | Migrate `skills/*` components, including creation/deletion dialogs, tags, cards, and resource files. | Skill form and card states, dialog states, tags, resource file list. | Create/edit/delete a disposable skill and restore the fixture; verify keyboard flows. |
| 24 | Migrate `projects/*` and `project-detail/*` components. | Project list/table, filters, overview, skill section, add/rename/delete dialogs. | Create/rename/delete a disposable project, filter the table, and restore the fixture. |
| 25 | Migrate route-local styling in `home.tsx` and `routes/__root.tsx`. | Home loading/empty/populated and shell states at both widths and themes. | Visit home, scroll its sections, navigate away and back. |
| 26 | Migrate `routes/tools.tsx` and `routes/tool-detail.tsx`. | Tool list and detail states, card grids, long names, loading/empty. | Browse tools, open a detail page, use its actions and browser history. |
| 27 | Migrate `routes/skill-library.tsx`. | Library grid/list, filters, search, empty and populated results. | Search, filter, change views, and inspect both viewport sizes. |
| 28 | Migrate `routes/skill-detail.tsx`. | Detail and edit states, long content, errors, resources, dark theme. | Edit and save a disposable skill; reopen it and verify focus and scrolling. |
| 29 | Migrate `routes/projects.tsx`. | Project list, filters, pagination/table states, empty results. | Filter, sort, paginate, and open a project on both viewport sizes. |
| 30 | Migrate `routes/project-detail.tsx`. | Overview, skills, long paths, dialog states, loading/empty. | Open a project, use its actions, navigate back and forward. |
| 31 | Migrate `routes/settings.tsx`. | All settings states, radios/switches/selects, light and dark. | Change each setting with pointer and keyboard, reload, and verify persistence. |
| 32 | Remove Tailwind Vite plugin and packages, `tw-animate-css`, shadcn Tailwind import, `cva`, `clsx`, `tailwind-merge`, and the `cn` helper only after an inventory confirms no use. Remove now-unused exported variant helpers after all callers have moved. Keep a minimal exact global reset/font stylesheet. Update `components.json` and styling docs so generators cannot reintroduce Tailwind classes. | Full frozen suite in dev and production, plus one screenshot of every test-only gallery component. Capture an Electron packaged build on supported OS runners. | Use every route in production preview and a packaged Electron app; inspect CSS assets, console, fonts, transitions, keyboard behavior, and titlebar controls. |

## Merge gates and final audit

- For each PR, the changed component's complete gallery states and all affected route states must pass exact comparisons against PR 00 originals. Run the whole matrix, not only touched snapshots, before merge. If screenshots are refreshed, refresh *only* to correct a broken original fixture and review that as its own PR against the frozen app.
- The visual suite must report browser and Electron version, viewport, scale, theme, fixture hash, and baseline commit so two runs can be reproduced. Store failure screenshots, diff images, and computed-style reports as CI artifacts.
- Check behavior with keyboard and pointer. For portals, compare placement and z-index; for animations, compare start, midpoint, and end; for responsive UI, compare both sides of each used breakpoint.
- In the final PR, search every `apps/ui/src` TSX/TS/CSS file for Tailwind utilities, `className` strings used for styling, `cva`, `cn`, `twMerge`, and `@apply`. A remaining match needs a documented reason and a test. Inspect built CSS for leftover Tailwind utility generation. No SkillForge-owned UI styling should depend on Tailwind.
- Run `pnpm typecheck`, `pnpm lint`, `pnpm build`, the visual suite, web live walkthrough, and packaged Electron walkthrough. Do not declare the migration complete with a failing or unreviewed visual case. Restore any observed original bug rather than fixing it inside this series.

## StyleX references

- [Official Vite + React setup](https://stylexjs.com/docs/learn/installation/vite/vite-react)
- [Official Vite integration](https://stylexjs.com/docs/learn/installation/vite/)
- [Defining variables and theme requirements](https://stylexjs.com/docs/learn/theming/defining-variables/)
- [Style definitions and dynamic values](https://stylexjs.com/docs/learn/styling-ui/defining-styles/)
- [Applying and composing styles](https://stylexjs.com/docs/api/javascript/props)
