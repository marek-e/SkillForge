import { defineConfig } from '@playwright/test'

/**
 * Visual regression configuration for the StyleX migration (PR 00).
 *
 * Every setting that can move a pixel is pinned here: one browser, one device
 * scale factor, one locale, one timezone, two fixed viewports. The originals in
 * `visual/__originals__` are frozen at the pre-migration commit and are never
 * refreshed to make a comparison pass.
 *
 * `VISUAL_BUILD=1` runs the same suite against the production build
 * (`vite build && vite preview`) instead of the dev server, against the *same*
 * originals, so a Vite plugin ordering or CSS emission difference shows up as a
 * pixel difference.
 */
const useProductionBuild = process.env.VISUAL_BUILD === '1'

const serverEnv = {
  VITE_VISUAL_GALLERY: 'true',
  VITE_API_URL: 'http://localhost:4321/api',
}

const devCommand = 'pnpm exec vite --port 4320 --strictPort'
const buildCommand = 'pnpm exec vite build && pnpm exec vite preview --port 4320 --strictPort'

export default defineConfig({
  testDir: './visual',
  testMatch: /.*\.spec\.ts$/,
  outputDir: './visual/results',
  snapshotPathTemplate: 'visual/__originals__/{projectName}/{testFileName}/{arg}{ext}',

  // Originals are immutable. `--update-snapshots` is not offered anywhere and a
  // missing original is a failure, not a prompt to create one.
  updateSnapshots: 'none',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // A flaky visual case must be made deterministic, never retried away.
  retries: 0,
  workers: process.env.CI ? 2 : 4,
  timeout: 90_000,

  reporter: [['list'], ['html', { outputFolder: 'visual/report', open: 'never' }]],

  expect: {
    timeout: 20_000,
    toHaveScreenshot: {
      maxDiffPixels: 0,
      maxDiffPixelRatio: 0,
      threshold: 0,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
    toMatchSnapshot: {
      maxDiffPixels: 0,
      threshold: 0,
    },
  },

  use: {
    baseURL: 'http://localhost:4320',
    browserName: 'chromium',
    // Chromium re-rasterises only the tiles it thinks are dirty, across several
    // raster threads, with runtime-selected Skia paths. That makes the
    // antialiasing of rounded corners, CSS filters and composited overlays
    // differ by a handful of pixels between otherwise identical runs. These
    // flags pin rasterisation and text rendering so an exact comparison is
    // meaningful. `--deterministic-mode` is deliberately not used: it implies
    // `--enable-begin-frame-control`, which expects the embedder to drive
    // frames and stalls rendering under Playwright.
    launchOptions: {
      args: [
        '--force-color-profile=srgb',
        '--font-render-hinting=none',
        '--disable-font-subpixel-positioning',
        '--disable-lcd-text',
        '--disable-skia-runtime-opts',
        '--disable-partial-raster',
        '--disable-checker-imaging',
        '--disable-image-animation-resync',
        '--disable-threaded-animation',
        '--disable-threaded-scrolling',
        '--disable-new-content-rendering-timeout',
        '--run-all-compositor-stages-before-draw',
        '--num-raster-threads=1',
        '--hide-scrollbars',
      ],
    },
    locale: 'en-US',
    timezoneId: 'UTC',
    deviceScaleFactor: 1,
    hasTouch: false,
    isMobile: false,
    trace: 'retain-on-failure',
    video: 'off',
    screenshot: 'off',
  },

  projects: [
    {
      name: 'desktop',
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      use: { viewport: { width: 390, height: 844 } },
    },
  ],

  webServer: {
    command: useProductionBuild ? buildCommand : devCommand,
    url: 'http://localhost:4320',
    env: serverEnv,
    reuseExistingServer: !process.env.CI && !useProductionBuild,
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 180_000,
  },
})
