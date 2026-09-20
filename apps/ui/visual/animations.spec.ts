import { test } from '@playwright/test'
import {
  expectShot,
  freezeAnimationsAt,
  gotoGallery,
  installAnimationFreeze,
  THEMES,
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
