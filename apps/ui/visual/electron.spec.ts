import fs from 'node:fs'
import path from 'node:path'
import { _electron as electron, test } from '@playwright/test'
import { installApiMock } from './api-mock'
import { expectRouteShots, expectShot, gotoRoute, settle, THEMES } from './helpers'

/**
 * Electron coverage comes in two layers.
 *
 * 1. The Electron *shell* rendered in Chromium with a fake `window.electronAPI`.
 *    `lib/electron.ts` reads that object at module scope, so the UI takes every
 *    Electron branch: the custom titlebar, the `.electron-app` sidebar offset
 *    rules, and the Electron-only buttons on the project overview card. This
 *    runs on every PR and is fully deterministic.
 *
 * 2. The real Electron host, behind `VISUAL_ELECTRON=1`. Launching it requires
 *    `pnpm --filter @skillforge/electron build` plus a `better-sqlite3` rebuilt
 *    against the Electron ABI, because `main.ts` boots the runtime before it
 *    opens the window. That is environment-specific, so it is opt-in and is
 *    skipped by default; see `docs/visual-testing.md`.
 */
const ELECTRON_ROUTES = [
  { id: 'home', path: '/' },
  { id: 'projects', path: '/projects' },
  { id: 'project-detail', path: '/projects/project-alpha' },
]

for (const platform of ['darwin', 'win32'] as const) {
  for (const route of ELECTRON_ROUTES) {
    for (const theme of THEMES) {
      test(`electron shell ${platform} ${route.id} ${theme}`, async ({ page }) => {
        await gotoRoute(page, route.path, { theme, electron: platform })
        await page.locator('.electron-app').first().waitFor({ state: 'visible' })
        await expectRouteShots(page, `electron-${platform}-${route.id}-${theme}`)
      })
    }
  }

  for (const theme of THEMES) {
    test(`electron titlebar ${platform} ${theme}`, async ({ page }) => {
      await gotoRoute(page, '/', { theme, electron: platform })
      const titlebar = page.locator('.electron-app > .drag').first()
      await titlebar.waitFor({ state: 'visible' })
      await expectShot(titlebar, `electron-titlebar-${platform}-${theme}.png`)
    })
  }
}

const electronMain = path.resolve(import.meta.dirname, '../../electron/dist/main.cjs')
const runRealElectron = process.env.VISUAL_ELECTRON === '1'

test.describe('real electron host', () => {
  test.skip(
    !runRealElectron,
    'Set VISUAL_ELECTRON=1 after building apps/electron and rebuilding better-sqlite3 for Electron.'
  )

  for (const theme of THEMES) {
    // Playwright requires the first argument to be a destructuring pattern.
    // eslint-disable-next-line no-empty-pattern
    test(`electron window ${theme}`, async ({}, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'The Electron window has one size.')
      test.skip(!fs.existsSync(electronMain), `Missing ${electronMain}; run the electron build.`)

      const app = await electron.launch({
        args: [electronMain],
        env: { ...process.env, NODE_ENV: 'development' },
      })
      try {
        const win = await app.firstWindow()
        await win.setViewportSize({ width: 1440, height: 900 })
        await installApiMock(win, 'populated')
        await win.addInitScript((value) => {
          try {
            globalThis.localStorage.setItem('theme', value)
          } catch {
            // Storage may be unavailable.
          }
        }, theme)
        await win.goto('http://localhost:4320/')
        await settle(win)
        await expectShot(win, `electron-real-window-${theme}.png`, { fullPage: true })
      } finally {
        await app.close()
      }
    })
  }
})
