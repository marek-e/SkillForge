import { test } from '@playwright/test'
import {
  expectShot,
  freezeAnimationsAt,
  gotoGallery,
  installAnimationFreeze,
  settle,
  THEMES,
  waitForAnimationsToFinish,
} from './helpers'

/**
 * Animations are captured at fixed timestamps rather than disabled globally.
 *
 * `animation-play-state: paused` is injected before the overlay opens so the
 * enter animation never advances on its own, then each frame is seeked with the
 * Web Animations API and captured with `animations: 'allow'`.
 */
const FRAMES = [0, 100, 200]

interface AnimationCase {
  id: string
  trigger: string
  content: string
}

const CASES: AnimationCase[] = [
  {
    id: 'dialog-open',
    trigger: '[data-gallery-case="dialog-trigger"] button',
    content: '[data-slot="dialog-content"]',
  },
  {
    id: 'alert-dialog-open',
    trigger: '[data-gallery-case="alert-dialog-trigger"] button',
    content: '[data-slot="alert-dialog-content"]',
  },
  {
    id: 'sheet-right-open',
    trigger: '[data-gallery-case="sheet-right-trigger"] button',
    content: '[data-slot="sheet-content"]',
  },
  {
    id: 'dropdown-menu-open',
    trigger: '[data-gallery-case="dropdown-menu-trigger"] button',
    content: '[data-slot="dropdown-menu-content"]',
  },
  {
    id: 'popover-open',
    trigger: '[data-gallery-case="popover-trigger"] button',
    content: '[data-slot="popover-content"]',
  },
]

for (const animation of CASES) {
  for (const theme of THEMES) {
    test(`animation ${animation.id} ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'overlays', { theme })
      await installAnimationFreeze(page)

      await page.locator(animation.trigger).first().click()
      await page.locator(animation.content).first().waitFor({ state: 'attached' })

      for (const frame of FRAMES) {
        await freezeAnimationsAt(page, frame)
        await expectShot(page, `animation-${animation.id}-${theme}-${frame}ms.png`, {
          fullPage: true,
          animations: 'allow',
        })
      }
    })
  }
}

test.describe('accordion frames', () => {
  for (const theme of THEMES) {
    test(`accordion expand ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'disclosure', { theme })
      await installAnimationFreeze(page)

      await page
        .locator('[data-gallery-case="accordion-collapsed"] [data-slot="accordion-trigger"]')
        .first()
        .click()
      await page
        .locator('[data-gallery-case="accordion-collapsed"] [data-slot="accordion-content"]')
        .first()
        .waitFor({ state: 'attached' })

      for (const frame of FRAMES) {
        await freezeAnimationsAt(page, frame)
        await expectShot(page, `animation-accordion-expand-${theme}-${frame}ms.png`, {
          fullPage: true,
          animations: 'allow',
        })
      }
    })
  }
})

/**
 * Infinite animations at fixed timestamps (PR 08).
 *
 * `animations: 'disabled'` parks an infinite animation on its first frame, so
 * every other screenshot in the suite shows `Skeleton` at full opacity and
 * `Spinner` unrotated. These three frames are the only proof that the pulse
 * and the spin keep Tailwind's duration, timing function and keyframes once
 * they are `stylex.keyframes`. 0 ms, 500 ms and 1000 ms land on three
 * different points of both curves (the pulse runs 2 s, the spin 1 s, so
 * 1000 ms is the pulse's trough and the spin's second start).
 */
const LOOP_FRAMES = [0, 500, 1000]

const LOOP_CASES = [
  { id: 'skeleton-pulse', selector: '[data-gallery-case="skeleton-pulse-target"]' },
  { id: 'spinner-spin', selector: '[data-gallery-case="spinner-frame-target"]' },
] as const

for (const loop of LOOP_CASES) {
  for (const theme of THEMES) {
    test(`animation ${loop.id} ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'feedback', { theme })
      await installAnimationFreeze(page)

      for (const frame of LOOP_FRAMES) {
        await freezeAnimationsAt(page, frame)
        await expectShot(
          page.locator(loop.selector),
          `animation-${loop.id}-${theme}-${frame}ms.png`,
          {
            animations: 'allow',
          }
        )
      }
    })
  }
}

/**
 * The exit half of the two dialog animations (PR 10).
 *
 * The exit `@keyframes` is a separate one from the enter pair and reads a
 * separate set of variables, so nothing above covers it: every case there
 * captures a panel on its way *in*. The freeze is installed after the enter
 * animation has finished rather than before it starts, so these frames begin
 * from a settled panel; `animation-play-state: paused` also keeps the element
 * mounted, because Radix removes it on `animationend`.
 */
const EXIT_CASES: AnimationCase[] = [
  {
    id: 'dialog-close',
    trigger: '[data-gallery-case="dialog-trigger"] button',
    content: '[data-slot="dialog-content"]',
  },
  {
    id: 'alert-dialog-close',
    trigger: '[data-gallery-case="alert-dialog-trigger"] button',
    content: '[data-slot="alert-dialog-content"]',
  },
]

for (const animation of EXIT_CASES) {
  for (const theme of THEMES) {
    test(`animation ${animation.id} ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'overlays', { theme })

      await page.locator(animation.trigger).first().click()
      await page.locator(animation.content).first().waitFor({ state: 'visible' })
      await settle(page)
      // The enter animation has to be over before the freeze goes in, or these
      // frames start from a half-faded panel.
      await waitForAnimationsToFinish(page)

      await installAnimationFreeze(page)
      await page.keyboard.press('Escape')
      await page
        .locator(`${animation.content}[data-state="closed"]`)
        .first()
        .waitFor({ state: 'attached' })
      // Radix keeps focus on the first button inside the panel for as long as
      // the panel is mounted, and the freeze keeps it mounted, so these frames
      // are taken with a focused — but, after a mouse-opened panel, not
      // focus-*visible* — button in them. One desktop frame out of twelve full
      // runs, on a cold server, came out with Chromium having promoted that
      // button to `:focus-visible` after the Escape keydown; see the flake note
      // in `docs/stylex-migration/pr-10.md`. Neither clearing the focus nor
      // dispatching an untrusted keydown fixes it — both change the frozen
      // frames — so the sequence is left exactly as the originals were
      // captured.
      for (const frame of FRAMES) {
        await freezeAnimationsAt(page, frame)
        await expectShot(page, `animation-${animation.id}-${theme}-${frame}ms.png`, {
          fullPage: true,
          animations: 'allow',
        })
      }
    })
  }
}

/**
 * The sheet's enter curve, one frame past its end (PR 11).
 *
 * `SheetContent` runs `enter` for 200 ms with `ease-in-out`, so the 0/100/200
 * frames above only prove the first half of the migration: they never show what
 * the element settles on once the animation is over. 300 ms does, and the extra
 * frame is what distinguishes a 200 ms run from a longer one that happens to
 * pass through the same three points.
 */
const SHEET_FRAMES = [0, 100, 200, 300]

test.describe('sheet enter frames', () => {
  for (const theme of THEMES) {
    test(`sheet right open settled ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'overlays-sheet-drawer', { theme })
      await installAnimationFreeze(page)

      await page.locator('[data-gallery-case="sheet-right-no-close-trigger"] button').click()
      await page.locator('[data-slot="sheet-content"]').first().waitFor({ state: 'attached' })

      for (const frame of SHEET_FRAMES) {
        await freezeAnimationsAt(page, frame)
        await expectShot(page, `animation-sheet-right-settled-${theme}-${frame}ms.png`, {
          fullPage: true,
          animations: 'allow',
        })
      }
    })
  }
})
