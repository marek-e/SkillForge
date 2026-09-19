# Frozen originals

The PNG and JSON snapshots under `__originals__/` are the release gate for the StyleX migration. They are **immutable** for the whole migration series.

They carry no platform suffix in their path, because the suite is defined to run on one OS image. Everything needed to reproduce them is recorded here.

## Baseline

|                 |                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------ |
| Baseline commit | `ee0f797` (`style(ui): update sidebar and accent colors, adjust sidebar width and layout`) |
| Branch          | `stylex-migration`                                                                         |
| Captured        | 2026-09-19                                                                                 |
| Fixtures        | `visual/fixtures/populated/`, `visual/fixtures/empty/`                                     |

## Capture environment

|                     |                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| OS                  | `Darwin Mac.lan 25.6.0 Darwin Kernel Version 25.6.0: Fri Jul 31 19:18:48 PDT 2026; root:xnu-12377.161.14~5/RELEASE_ARM64_T6020 arm64` |
| Architecture        | arm64 (Apple silicon)                                                                                                                 |
| Node                | v24.15.0 (CI uses 22.22.0; Node version does not affect rendering)                                                                    |
| pnpm                | 9.15.9                                                                                                                                |
| Playwright          | 1.63.0 (pinned exactly in `apps/ui/package.json`)                                                                                     |
| Chromium            | Google Chrome for Testing 153.0.8010.12 (`playwright build v1243`)                                                                    |
| Headless shell      | Chrome Headless Shell 153.0.8010.12 (`playwright chromium-headless-shell v1243`)                                                      |
| Device scale factor | 1                                                                                                                                     |
| Viewports           | `desktop` 1440×900, `mobile` 390×844                                                                                                  |
| Locale / timezone   | `en-US` / `UTC`                                                                                                                       |
| Fonts               | `@fontsource-variable/geist` 5.2.8, `@fontsource/medievalsharp` 5.2.8 (bundled, no network fonts)                                     |

CI runs the suite on `macos-15` for this reason. A Linux runner rasterises text differently and would fail against these originals.

## Rules

- Never regenerate an original to make a comparison pass.
- `visual:update` writes only _missing_ originals (`--update-snapshots=missing`); it can never overwrite one.
- Replacing an existing original requires its own PR against the frozen app, reviewed on its own merits.
- Deleting a case means deleting its original in the same PR; `visual:check-originals` fails on orphans.

See [docs/visual-testing.md](../../../docs/visual-testing.md).
