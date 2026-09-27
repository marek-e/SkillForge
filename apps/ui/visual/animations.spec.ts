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

/**
 * Popover and tooltip enter frames (PR 12).
 *
 * Both are `tw-animate-css`'s `enter` keyframes — an opacity, a scale and a
 * per-side translate composed into one `transform` — but they run for
 * different durations: the popover carries `duration-100`, which sets
 * `--tw-duration`, while the tooltip has none and falls back to the 0.15s the
 * `--animate-in` shorthand names. So 100 ms is the popover's last frame and the
 * tooltip's two-thirds point, which is what separates a correct
 * `animation-duration` from a plausible one.
 *
 * The popover case asks for `side="top"`, the tooltip for the default side, so
 * the two translate along opposite directions as well.
 */
test.describe('floating frames', () => {
  for (const theme of THEMES) {
    test(`popover side top open ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'floating-extra', { theme })
      await installAnimationFreeze(page)

      await page.locator('[data-gallery-case="popover-side-top-trigger"] button').click()
      await page.locator('[data-slot="popover-content"]').waitFor({ state: 'attached' })

      for (const frame of FRAMES) {
        await freezeAnimationsAt(page, frame)
        await expectShot(page, `animation-popover-side-top-open-${theme}-${frame}ms.png`, {
          fullPage: true,
          animations: 'allow',
        })
      }
    })

    test(`tooltip open ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'floating-extra', { theme })
      await installAnimationFreeze(page)

      await page.locator('[data-gallery-case="tooltip-side-bottom-target"] button').hover()
      await page.locator('[data-slot="tooltip-content"]').waitFor({ state: 'attached' })

      for (const frame of FRAMES) {
        await freezeAnimationsAt(page, frame)
        await expectShot(page, `animation-tooltip-open-${theme}-${frame}ms.png`, {
          fullPage: true,
          animations: 'allow',
        })
      }
    })
  }
})

/**
 * The popover's exit frames (PR 12).
 *
 * `data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95` is
 * the only part of this row that nothing else reaches: the keyboard test in
 * `overlays.spec.ts` waits for the content to detach, and a computed-style dump
 * of an element mid-unmount is not reproducible. There is no `slide-out-to-*`
 * class on any of the three, so the exit translate stays at zero whatever side
 * the content resolved to — which is why one side is enough here.
 *
 * The freeze style is installed before the popover opens, so the enter
 * animation never completes and Radix's `Presence` still has the element
 * mounted when the second click flips `data-state` to `closed`.
 */
test.describe('floating exit frames', () => {
  for (const theme of THEMES) {
    test(`popover side top close ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'floating-extra', { theme })
      await installAnimationFreeze(page)

      const trigger = page.locator('[data-gallery-case="popover-side-top-trigger"] button')
      await trigger.click()
      await page.locator('[data-slot="popover-content"]').waitFor({ state: 'attached' })
      await trigger.click()
      await page
        .locator('[data-slot="popover-content"][data-state="closed"]')
        .waitFor({ state: 'attached' })

      for (const frame of FRAMES) {
        await freezeAnimationsAt(page, frame)
        await expectShot(page, `animation-popover-side-top-close-${theme}-${frame}ms.png`, {
          fullPage: true,
          animations: 'allow',
        })
      }
    })
  }
})

/**
 * Menu enter animations (PR 13).
 *
 * The existing `dropdown-menu-open` case above stays exactly as it is; these
 * add the offsets it cannot reach. The menu enter animation composes one
 * keyframe set out of an opacity step, a 95% scale and a per-`data-[side]`
 * translate, so a menu that opens downwards and one that opens upwards run
 * *different* keyframes;
 * `duration-100` shortens both to 100ms, which is why 200ms is the settled
 * frame. `DropdownMenuSubContent` and `ContextMenuContent` carry their own
 * radius, shadow and min-width, so each is captured on its own curve.
 */
const MENU_ANIMATION_CASES = [
  {
    id: 'menus-extra-dropdown-open',
    trigger: '[data-gallery-case="menu-dropdown-rich"] button',
    content: '[data-slot="dropdown-menu-content"]',
  },
  {
    id: 'menus-extra-dropdown-side-top-open',
    trigger: '[data-gallery-case="menu-dropdown-side-top"] button',
    content: '[data-slot="dropdown-menu-content"]',
  },
] as const

for (const animation of MENU_ANIMATION_CASES) {
  for (const theme of THEMES) {
    test(`animation ${animation.id} ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'menus-extra', { theme })
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

test.describe('menu submenu and context menu frames', () => {
  for (const theme of THEMES) {
    /**
     * The freeze is installed **after** the parent menu has finished its own
     * enter animation, which the other cases do not need to do.
     *
     * A submenu is positioned by Floating UI against the sub-trigger's measured
     * rect, and that rect is inside the parent content's enter-scale
     * transform. Freezing the parent mid-animation therefore anchors the
     * submenu ~4px to the left, and whether the parent's paused animation had
     * settled by the time the shot was taken decided the layout of the whole
     * frame: the case failed roughly one run in three against its own
     * originals, on the untouched Tailwind tree. Letting the parent settle
     * first leaves exactly one animation on the page — the sub-content's, the
     * one being measured — which is the shape every stable case in this file
     * has.
     */
    test(`dropdown submenu open ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'menus-extra', { theme })

      await page.locator('[data-gallery-case="menu-dropdown-rich"] button').click()
      const content = page.locator('[data-slot="dropdown-menu-content"]')
      await content.waitFor({ state: 'visible' })
      await content.evaluate((element) =>
        Promise.all(element.getAnimations().map((animation) => animation.finished))
      )

      await installAnimationFreeze(page)
      await page.locator('[data-slot="dropdown-menu-sub-trigger"]').hover()
      await page.locator('[data-slot="dropdown-menu-sub-content"]').waitFor({ state: 'attached' })

      for (const frame of FRAMES) {
        await freezeAnimationsAt(page, frame)
        await expectShot(page, `animation-menus-extra-submenu-open-${theme}-${frame}ms.png`, {
          fullPage: true,
          animations: 'allow',
        })
      }
    })

    test(`context menu open ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'menus-extra', { theme })
      await installAnimationFreeze(page)

      await page
        .locator('[data-gallery-case="menu-context-rich"] [data-slot="context-menu-trigger"]')
        .click({ button: 'right' })
      await page.locator('[data-slot="context-menu-content"]').waitFor({ state: 'attached' })

      for (const frame of FRAMES) {
        await freezeAnimationsAt(page, frame)
        await expectShot(page, `animation-menus-extra-context-open-${theme}-${frame}ms.png`, {
          fullPage: true,
          animations: 'allow',
        })
      }
    })
  }
})

/**
 * Menubar and navigation-menu enter frames (PR 14).
 *
 * The menubar content composes `enter` from `data-open:fade-in-0`,
 * `data-open:zoom-in-95` and a per-side `data-[side=*]:slide-in-from-*-2`, over
 * the 100ms `duration-100` puts on it. The navigation menu's first open has no
 * `data-motion` on the content, so what animates is the shared viewport, with
 * `data-open:zoom-in-90` and no fade — these frames are what pins that.
 */
test.describe('menubar-nav frames', () => {
  for (const theme of THEMES) {
    test(`animation menubar-nav menubar-open ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'menubar-nav-extra', { theme })
      await installAnimationFreeze(page)

      await page
        .locator('[data-gallery-case="menubar-nav-bar-rich"] [data-slot="menubar-trigger"]')
        .first()
        .click()
      await page.locator('[data-slot="menubar-content"]').waitFor({ state: 'attached' })

      for (const frame of FRAMES) {
        await freezeAnimationsAt(page, frame)
        await expectShot(page, `animation-menubar-nav-menubar-open-${theme}-${frame}ms.png`, {
          fullPage: true,
          animations: 'allow',
        })
      }
    })

    test(`animation menubar-nav nav-content-open ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'menubar-nav-extra', { theme })
      await installAnimationFreeze(page)

      await page
        .locator(
          '[data-gallery-case="menubar-nav-nav-viewport"] [data-slot="navigation-menu-trigger"]'
        )
        .first()
        .click()
      await page.locator('[data-slot="navigation-menu-viewport"]').waitFor({ state: 'attached' })

      for (const frame of FRAMES) {
        await freezeAnimationsAt(page, frame)
        await expectShot(page, `animation-menubar-nav-nav-content-open-${theme}-${frame}ms.png`, {
          fullPage: true,
          animations: 'allow',
        })
      }
    })
  }
})

/**
 * The select popup's enter animation (PR 15).
 *
 * `SelectContent` only animates in `position="popper"`: the item-aligned
 * default carries `data-[align-trigger=true]:animate-none`, which wins over
 * the `data-open:` enter rules. The popper case is therefore the one worth
 * three frames — `duration-100` makes it the fastest overlay in the suite, so
 * 100 ms is already its end state and 200 ms proves it stays there.
 */
test.describe('selcombo animation frames', () => {
  for (const theme of THEMES) {
    test(`animation selcombo select-open ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'select-combobox-extra', { theme })
      await installAnimationFreeze(page)

      await page
        .locator('[data-gallery-case="selcombo-select-popper"] [data-slot="select-trigger"]')
        .click()
      await page.locator('[data-slot="select-content"]').first().waitFor({ state: 'attached' })

      for (const frame of FRAMES) {
        await freezeAnimationsAt(page, frame)
        await expectShot(page, `animation-selcombo-select-open-${theme}-${frame}ms.png`, {
          fullPage: true,
          animations: 'allow',
        })
      }
    })
  }
})
