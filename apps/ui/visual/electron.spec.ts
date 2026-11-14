import fs from 'node:fs'
import path from 'node:path'
import { _electron as electron, test } from '@playwright/test'
import { installApiMock } from './api-mock'
import {
  expectRouteShots,
  expectShot,
  expectTextSnapshot,
  gotoRoute,
  settle,
  THEMES,
} from './helpers'

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

/**
 * The titlebar clearance, as numbers (PR 17).
 *
 * `styles/global.css` offsets the fixed sidebar container and the wrapper below
 * the 36px titlebar from an **unlayered** rule, which outranks both Tailwind
 * and StyleX. PR 17 moves those declarations onto the components, so the
 * offsets need a snapshot that a screenshot of a mostly-identical page cannot
 * give. `computed-styles.spec.ts` covers the same rules on the gallery shells,
 * where both `side` values and the rail exist.
 */
const ELECTRON_GEOMETRY = [
  { id: 'wrapper', selector: '[data-slot="sidebar-wrapper"]' },
  { id: 'sidebar', selector: '[data-slot="sidebar"]' },
  { id: 'gap', selector: '[data-slot="sidebar-gap"]' },
  { id: 'container', selector: '[data-slot="sidebar-container"]' },
  { id: 'inner', selector: '[data-slot="sidebar-inner"]' },
  { id: 'inset', selector: '[data-slot="sidebar-inset"]' },
  { id: 'rail', selector: '[data-slot="sidebar-rail"]' },
  { id: 'titlebar', selector: '.electron-app > .drag' },
]

const ELECTRON_PROPERTIES = [
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'width',
  'height',
  'min-height',
  'margin',
  'padding',
  'z-index',
]

for (const platform of ['darwin', 'win32'] as const) {
  for (const theme of THEMES) {
    test(`electron sidebarx geometry ${platform} ${theme}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'The Electron shell is a desktop window.')
      await gotoRoute(page, '/', { theme, electron: platform })
      await page.locator('.electron-app').first().waitFor({ state: 'visible' })

      const report = await page.evaluate(
        ({ elements, properties }) => {
          const round = (value: number) => Math.round(value * 100) / 100
          return elements.map(({ id, selector }) => {
            const element = document.querySelector(selector)
            if (!element) return { id, selector, present: false }
            const rect = element.getBoundingClientRect()
            const computed = getComputedStyle(element)
            const styles: Record<string, string> = {}
            for (const property of properties)
              styles[property] = computed.getPropertyValue(property)
            return {
              id,
              selector,
              present: true,
              box: {
                x: round(rect.x),
                y: round(rect.y),
                width: round(rect.width),
                height: round(rect.height),
              },
              styles,
            }
          })
        },
        { elements: ELECTRON_GEOMETRY, properties: ELECTRON_PROPERTIES }
      )

      await expectTextSnapshot(
        `${JSON.stringify(report, null, 2)}\n`,
        `electron-sidebarx-geometry-${platform}-${theme}.json`
      )
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
        await win.goto(`http://localhost:${process.env.VISUAL_PORT ?? 4320}/`)
        await settle(win)
        await expectShot(win, `electron-real-window-${theme}.png`, { fullPage: true })
      } finally {
        await app.close()
      }
    })
  }
})
