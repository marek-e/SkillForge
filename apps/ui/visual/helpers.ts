import fs from 'node:fs'
import path from 'node:path'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { apiTraffic, installApiMock, type DataMode } from './api-mock'

export type Theme = 'light' | 'dark'

export const FROZEN_NOW = '2025-06-01T12:00:00.000Z'

export const RESULTS_DIR = path.join(import.meta.dirname, 'results')
const USED_ORIGINALS_LOG = path.join(RESULTS_DIR, 'used-originals.log')

export interface PrepareOptions {
  /** Forced next-themes value. Also drives Playwright's emulated `prefers-color-scheme`. */
  theme?: Theme
  /** Which fixture payloads the mocked API serves. */
  data?: DataMode
  /** Emulated `prefers-reduced-motion`. */
  reducedMotion?: 'reduce' | 'no-preference'
  /** Extra localStorage entries written before the app boots. */
  storage?: Record<string, string>
  /** Installs a fake `window.electronAPI` so the UI takes its Electron branches. */
  electron?: false | 'darwin' | 'win32'
}

/**
 * Everything that has to be pinned before the first byte of app code runs:
 * theme, persisted settings, the sidebar cookie, and `Math.random`, which
 * `SidebarMenuSkeleton` uses for its bar width.
 */
async function addDeterminismInitScript(page: Page, options: PrepareOptions): Promise<void> {
  const theme: Theme = options.theme ?? 'light'
  const storage: Record<string, string> = {
    theme,
    'skillforge:defaultEditor': 'auto',
    'skillforge:customEditorCmd': '',
    'skillforge:defaultSkillView': 'list',
    ...options.storage,
  }
  const electron = options.electron ?? false

  await page.addInitScript(
    ({ storage, theme, electron }) => {
      // `SidebarMenuSkeleton` randomises its bar width with `Math.random()`.
      // A constant is used rather than a seeded sequence because React's
      // StrictMode double-invokes state initialisers in development but not in
      // production, so a sequence would advance a different number of times in
      // `pnpm visual` and in `VISUAL_BUILD=1 pnpm visual`.
      Math.random = () => 0.5

      try {
        window.localStorage.clear()
        for (const [key, value] of Object.entries(storage)) {
          window.localStorage.setItem(key, value)
        }
      } catch {
        // Storage can be unavailable; the app still renders.
      }

      try {
        document.cookie = 'sidebar_state=true; path=/'
      } catch {
        // Cookies can be unavailable.
      }

      // The init script can run before `documentElement` exists, so the theme
      // class is applied again once the document is parsed.
      const applyTheme = () => {
        const root = document.documentElement
        if (!root) return
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
        root.style.colorScheme = theme
      }
      applyTheme()
      document.addEventListener('DOMContentLoaded', applyTheme)

      if (electron) {
        const noop = async () => undefined
        Object.defineProperty(window, 'electronAPI', {
          configurable: true,
          value: {
            isElectron: true,
            platform: electron,
            minimizeWindow: noop,
            maximizeWindow: noop,
            closeWindow: noop,
            openFolderDialog: async () => null,
            openFileDialog: async () => null,
            revealInFinder: noop,
            openInEditor: async () => 'cursor',
          },
        })
      }
    },
    { storage, theme, electron }
  )
}

/** Pins theme, media, clock and API before any navigation. */
export async function preparePage(page: Page, options: PrepareOptions = {}): Promise<void> {
  const theme: Theme = options.theme ?? 'light'
  await page.emulateMedia({
    colorScheme: theme,
    reducedMotion: options.reducedMotion ?? 'no-preference',
  })
  await page.clock.setFixedTime(new Date(FROZEN_NOW))
  await addDeterminismInitScript(page, options)
  await installApiMock(page, options.data ?? 'populated')
}

/**
 * Waits until at least one request has been served and the mocked API has then
 * been quiet for `quietMs`.
 *
 * The window has to be wider than the longest retry gap TanStack Query uses
 * (1s, 2s, 4s), otherwise a capture can land between two retries and freeze the
 * loading state instead of the error state.
 */
async function waitForApiQuiet(page: Page, quietMs: number): Promise<void> {
  const deadline = Date.now() + 60_000
  for (;;) {
    const traffic = apiTraffic(page)
    const idleFor = Date.now() - traffic.lastRequestAt
    if (traffic.requestCount > 0 && idleFor >= quietMs) return
    if (Date.now() > deadline) return
    await page.waitForTimeout(500)
  }
}

export interface SettleOptions {
  data?: DataMode
  /** A selector that must be visible before the page counts as settled. */
  waitFor?: string
}

/**
 * Waits for fonts, data and layout before a capture.
 *
 * `error` mode is the slow path: TanStack Query retries three times with a
 * 1s/2s/4s backoff, so the page is only final once the API has gone quiet.
 */
export async function settle(page: Page, options: SettleOptions = {}): Promise<void> {
  const data = options.data ?? 'populated'

  if (data === 'loading') {
    await page.locator('[data-slot="skeleton"]').first().waitFor({ state: 'visible' })
  } else if (data === 'error') {
    await waitForApiQuiet(page, 8_000)
  } else {
    await page.waitForLoadState('networkidle')
  }

  if (options.waitFor) {
    await page.locator(options.waitFor).first().waitFor({ state: 'visible' })
  }

  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))))
}

export interface GotoOptions extends PrepareOptions, SettleOptions {}

/** Prepares determinism, navigates, and waits until the route is stable. */
export async function gotoRoute(
  page: Page,
  route: string,
  options: GotoOptions = {}
): Promise<void> {
  await preparePage(page, options)
  await page.goto(route, { waitUntil: 'commit' })
  await settle(page, options)
  // A control that autofocuses on mount can leave the scroll container part way
  // down the page, so every route capture starts from the top. The layout nests
  // two <main> elements (SidebarInset is one); the inner, last one scrolls.
  await page.evaluate(() => {
    const mains = document.querySelectorAll('main')
    mains[mains.length - 1]?.scrollTo(0, 0)
    window.scrollTo(0, 0)
  })
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))))
}

/** Navigates to a test-only gallery section. */
export async function gotoGallery(
  page: Page,
  section: string,
  options: GotoOptions = {}
): Promise<void> {
  await gotoRoute(page, `/__gallery/${section}`, {
    ...options,
    waitFor: options.waitFor ?? `[data-gallery-section="${section}"]`,
  })
}

function recordUsedOriginal(name: string): void {
  const snapshotPath = test.info().snapshotPath(name)
  fs.mkdirSync(RESULTS_DIR, { recursive: true })
  fs.appendFileSync(USED_ORIGINALS_LOG, `${snapshotPath}\n`)
}

export interface ShotOptions {
  fullPage?: boolean
  animations?: 'disabled' | 'allow'
  mask?: Locator[]
}

/**
 * Compares a page or element against its frozen original.
 *
 * Originals are never refreshed to make a comparison pass; see
 * `docs/visual-testing.md`.
 */
export async function expectShot(
  target: Page | Locator,
  name: string,
  options: ShotOptions = {}
): Promise<void> {
  recordUsedOriginal(name)
  await expect(target).toHaveScreenshot(name, {
    animations: options.animations ?? 'disabled',
    caret: 'hide',
    ...('fullPage' in options ? { fullPage: options.fullPage } : {}),
    ...(options.mask ? { mask: options.mask } : {}),
  })
}

/** Compares a JSON/text report against its frozen original. */
export async function expectTextSnapshot(content: string, name: string): Promise<void> {
  recordUsedOriginal(name)
  expect(content).toMatchSnapshot(name)
}

/** Full-page capture plus a second capture with the scroll container at its end. */
export async function expectRouteShots(page: Page, baseName: string): Promise<void> {
  await expectShot(page, `${baseName}.png`, { fullPage: true })
  await page.evaluate(() => {
    const mains = document.querySelectorAll('main')
    const scroller = mains[mains.length - 1]
    if (scroller) scroller.scrollTop = scroller.scrollHeight
  })
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))))
  await expectShot(page, `${baseName}-scrolled.png`, { fullPage: true })
}

/**
 * Waits until an element's position and transform have stopped changing.
 *
 * Used for JavaScript-driven motion (Embla, Vaul) that Playwright's
 * `animations: 'disabled'` cannot fast-forward.
 */
export async function waitForStable(page: Page, selector: string): Promise<void> {
  await page.waitForFunction(
    (sel) => {
      const element = document.querySelector(sel)
      if (!element) return false
      const rect = element.getBoundingClientRect()
      const key = `${rect.x},${rect.y},${rect.width},${rect.height},${getComputedStyle(element).transform}`
      const store = window as unknown as { __visualKey?: string; __visualStable?: number }
      if (store.__visualKey === key) {
        store.__visualStable = (store.__visualStable ?? 0) + 1
      } else {
        store.__visualKey = key
        store.__visualStable = 0
      }
      return (store.__visualStable ?? 0) >= 5
    },
    selector,
    { polling: 100 }
  )
}

/** Captures a single gallery case element. */
export async function expectCaseShot(
  page: Page,
  caseName: string,
  fileName: string
): Promise<void> {
  const locator = page.locator(`[data-gallery-case="${caseName}"]`)
  await locator.waitFor({ state: 'visible' })
  await expectShot(locator, fileName)
}

const FREEZE_STYLE_ID = 'visual-animation-freeze'

/**
 * Stops CSS animations from advancing on their own.
 *
 * Must be installed before the animation starts. `page.clock` controls
 * JavaScript timers but not the compositor clock behind CSS animations, so
 * fixed-timestamp capture goes through `animation-play-state` plus the Web
 * Animations API instead.
 */
export async function installAnimationFreeze(page: Page): Promise<void> {
  await page.evaluate((id) => {
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent =
      '*, *::before, *::after { animation-play-state: paused !important; transition-delay: 0s !important; }'
    document.head.append(style)
  }, FREEZE_STYLE_ID)
}

/** Moves every animation and transition on the page to a fixed timestamp. */
export async function freezeAnimationsAt(page: Page, timeMs: number): Promise<void> {
  await page.evaluate((time) => {
    for (const animation of document.getAnimations()) {
      animation.pause()
      try {
        animation.currentTime = time
      } catch {
        // Animations without a resolved timeline cannot be seeked.
      }
    }
  }, timeMs)
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))))
}

export const THEMES: Theme[] = ['light', 'dark']
