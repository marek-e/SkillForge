import { expect, test, type Page } from '@playwright/test'
import {
  expectShot,
  gotoGallery,
  gotoRoute,
  settle,
  THEMES,
  waitForAnimationsToFinish,
  waitForStable,
} from './helpers'

type OpenBy = 'click' | 'hover' | 'contextmenu'

interface OverlayCase {
  /** Snapshot name fragment. */
  id: string
  /** Selector for the element that opens the overlay. */
  trigger: string
  /** Selector that must become visible once the overlay is open. */
  content: string
  openBy?: OpenBy
  /** Motion driven by JavaScript rather than CSS needs an explicit settle. */
  jsMotion?: boolean
}

const OVERLAY_CASES: OverlayCase[] = [
  {
    id: 'dialog',
    trigger: '[data-gallery-case="dialog-trigger"] button',
    content: '[data-slot="dialog-content"]',
  },
  {
    id: 'alert-dialog',
    trigger: '[data-gallery-case="alert-dialog-trigger"] button',
    content: '[data-slot="alert-dialog-content"]',
  },
  {
    id: 'alert-dialog-sm',
    trigger: '[data-gallery-case="alert-dialog-sm-trigger"] button',
    content: '[data-slot="alert-dialog-content"]',
  },
  {
    id: 'sheet-right',
    trigger: '[data-gallery-case="sheet-right-trigger"] button',
    content: '[data-slot="sheet-content"]',
  },
  {
    id: 'sheet-left',
    trigger: '[data-gallery-case="sheet-left-trigger"] button',
    content: '[data-slot="sheet-content"]',
  },
  {
    id: 'sheet-top',
    trigger: '[data-gallery-case="sheet-top-trigger"] button',
    content: '[data-slot="sheet-content"]',
  },
  {
    id: 'sheet-bottom',
    trigger: '[data-gallery-case="sheet-bottom-trigger"] button',
    content: '[data-slot="sheet-content"]',
  },
  {
    id: 'drawer-bottom',
    trigger: '[data-gallery-case="drawer-bottom-trigger"] button',
    content: '[data-slot="drawer-content"]',
    jsMotion: true,
  },
  {
    id: 'drawer-right',
    trigger: '[data-gallery-case="drawer-right-trigger"] button',
    content: '[data-slot="drawer-content"]',
    jsMotion: true,
  },
  {
    id: 'popover',
    trigger: '[data-gallery-case="popover-trigger"] button',
    content: '[data-slot="popover-content"]',
  },
  {
    id: 'tooltip',
    trigger: '[data-gallery-case="tooltip-trigger"] button',
    content: '[data-slot="tooltip-content"]',
    openBy: 'hover',
  },
  {
    id: 'hover-card',
    trigger: '[data-gallery-case="hover-card-trigger"] button',
    content: '[data-slot="hover-card-content"]',
    openBy: 'hover',
  },
  {
    id: 'dropdown-menu',
    trigger: '[data-gallery-case="dropdown-menu-trigger"] button',
    content: '[data-slot="dropdown-menu-content"]',
  },
  {
    id: 'context-menu',
    trigger: '[data-gallery-case="context-menu-trigger"] [data-slot="context-menu-trigger"]',
    content: '[data-slot="context-menu-content"]',
    openBy: 'contextmenu',
  },
  {
    id: 'menubar',
    trigger: '[data-gallery-case="menubar-closed"] [data-slot="menubar-trigger"]',
    content: '[data-slot="menubar-content"]',
  },
  {
    id: 'navigation-menu',
    trigger: '[data-gallery-case="navigation-menu-closed"] [data-slot="navigation-menu-trigger"]',
    content: '[data-slot="navigation-menu-content"]',
  },
  {
    id: 'select',
    trigger: '[data-gallery-case="select-closed"] [data-slot="select-trigger"]',
    content: '[data-slot="select-content"]',
  },
  {
    id: 'combobox',
    trigger: '[data-gallery-case="combobox-closed"] input',
    content: '[data-slot="combobox-content"]',
  },
  {
    id: 'calendar-popover',
    trigger: '[data-gallery-case="calendar-in-popover-trigger"] button',
    content: '[data-slot="popover-content"]',
  },
]

async function open(page: Page, overlay: OverlayCase): Promise<void> {
  const trigger = page.locator(overlay.trigger).first()
  await trigger.scrollIntoViewIfNeeded()
  if (overlay.openBy === 'hover') {
    await trigger.hover()
  } else if (overlay.openBy === 'contextmenu') {
    await trigger.click({ button: 'right' })
  } else {
    await trigger.click()
  }
  await page.locator(overlay.content).first().waitFor({ state: 'visible' })
  if (overlay.jsMotion) {
    await waitForStable(page, overlay.content)
  }
  await settle(page)
}

for (const overlay of OVERLAY_CASES) {
  for (const theme of THEMES) {
    test(`overlay ${overlay.id} ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'overlays', { theme })
      await open(page, overlay)
      await expectShot(page, `overlay-${overlay.id}-${theme}.png`, { fullPage: true })
    })
  }
}

test.describe('submenus', () => {
  for (const theme of THEMES) {
    test(`dropdown menu submenu ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'overlays', { theme })
      await page.locator('[data-gallery-case="dropdown-menu-trigger"] button').click()
      await page.locator('[data-slot="dropdown-menu-content"]').waitFor({ state: 'visible' })
      await page.locator('[data-slot="dropdown-menu-sub-trigger"]').hover()
      await page.locator('[data-slot="dropdown-menu-sub-content"]').waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `overlay-dropdown-menu-submenu-${theme}.png`, { fullPage: true })
    })

    test(`context menu submenu ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'overlays', { theme })
      await page
        .locator('[data-gallery-case="context-menu-trigger"] [data-slot="context-menu-trigger"]')
        .click({ button: 'right' })
      await page.locator('[data-slot="context-menu-content"]').waitFor({ state: 'visible' })
      await page.locator('[data-slot="context-menu-sub-trigger"]').hover()
      await page.locator('[data-slot="context-menu-sub-content"]').waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `overlay-context-menu-submenu-${theme}.png`, { fullPage: true })
    })

    test(`menubar submenu ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'overlays', { theme })
      await page
        .locator('[data-gallery-case="menubar-closed"] [data-slot="menubar-trigger"]')
        .first()
        .click()
      await page.locator('[data-slot="menubar-content"]').waitFor({ state: 'visible' })
      await page.locator('[data-slot="menubar-sub-trigger"]').hover()
      await page.locator('[data-slot="menubar-sub-content"]').waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `overlay-menubar-submenu-${theme}.png`, { fullPage: true })
    })
  }
})

const APP_DIALOGS = [
  'create-skill',
  'delete-skill',
  'delete-skill-pending',
  'add-project',
  'add-project-error',
  'delete-project',
  'rename-project',
  'rename-project-pending',
]

for (const dialog of APP_DIALOGS) {
  for (const theme of THEMES) {
    test(`app dialog ${dialog} ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'app-dialogs', { theme })
      await page.locator(`[data-gallery-case="open-${dialog}"] button`).click()
      await page.locator('[data-slot="dialog-content"]').waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `app-dialog-${dialog}-${theme}.png`, { fullPage: true })
    })
  }
}

test.describe('route overlays', () => {
  for (const theme of THEMES) {
    test(`skill library create dialog ${theme}`, async ({ page }) => {
      await gotoRoute(page, '/skill-library', { theme })
      await page.getByRole('button', { name: 'New skill' }).click()
      await page.locator('[data-slot="dialog-content"]').waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `route-skill-library-create-dialog-${theme}.png`, { fullPage: true })
    })

    test(`projects tool dropdown ${theme}`, async ({ page }) => {
      await gotoRoute(page, '/tools', { theme })
      await page
        .locator('[data-slot="card"]')
        .filter({ hasText: 'Gemini CLI' })
        .locator('[data-slot="dropdown-menu-trigger"]')
        .click()
      await page.locator('[data-slot="dropdown-menu-content"]').waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `route-tools-download-menu-${theme}.png`, { fullPage: true })
    })

    test(`mode toggle menu ${theme}`, async ({ page }) => {
      await gotoRoute(page, '/', { theme })
      await page.getByRole('button', { name: 'Toggle theme' }).click()
      await page.locator('[data-slot="dropdown-menu-content"]').waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `route-mode-toggle-menu-${theme}.png`, { fullPage: true })
    })
  }
})

/**
 * The dialog and alert-dialog branches that live in the `overlays-extra`
 * section (PR 10).
 *
 * Same open-and-capture shape as `OVERLAY_CASES` above, on the sibling
 * section. `command-dialog` has no trigger inside the overlay tree: it is a
 * controlled dialog opened by a plain button, which is exactly the call site
 * that overrides half of the content's `translate`.
 */
const OVERLAY_EXTRA_CASES: OverlayCase[] = [
  {
    id: 'dialog-no-close',
    trigger: '[data-gallery-case="dialog-no-close-trigger"] button',
    content: '[data-slot="dialog-content"]',
  },
  {
    id: 'dialog-footer-close',
    trigger: '[data-gallery-case="dialog-footer-close-trigger"] button',
    content: '[data-slot="dialog-content"]',
  },
  {
    id: 'dialog-tall',
    trigger: '[data-gallery-case="dialog-tall-trigger"] button',
    content: '[data-slot="dialog-content"]',
  },
  {
    id: 'dialog-wide-child',
    trigger: '[data-gallery-case="dialog-wide-child-trigger"] button',
    content: '[data-slot="dialog-content"]',
  },
  {
    id: 'dialog-nested-select',
    trigger: '[data-gallery-case="dialog-nested-select-trigger"] button',
    content: '[data-slot="dialog-content"]',
  },
  {
    id: 'dialog-inherited-leading',
    trigger: '[data-gallery-case="dialog-inherited-leading-trigger"] button',
    content: '[data-slot="dialog-content"]',
  },
  {
    id: 'command-dialog',
    trigger: '[data-gallery-case="command-dialog-trigger"] button',
    content: '[data-slot="dialog-content"]',
  },
  {
    id: 'alert-dialog-default-no-media',
    trigger: '[data-gallery-case="alert-dialog-default-no-media-trigger"] button',
    content: '[data-slot="alert-dialog-content"]',
  },
  {
    id: 'alert-dialog-sm-media',
    trigger: '[data-gallery-case="alert-dialog-sm-media-trigger"] button',
    content: '[data-slot="alert-dialog-content"]',
  },
  {
    id: 'alert-dialog-small-actions',
    trigger: '[data-gallery-case="alert-dialog-small-actions-trigger"] button',
    content: '[data-slot="alert-dialog-content"]',
  },
  {
    id: 'alert-dialog-inherited-leading',
    trigger: '[data-gallery-case="alert-dialog-inherited-leading-trigger"] button',
    content: '[data-slot="alert-dialog-content"]',
  },
]

for (const overlay of OVERLAY_EXTRA_CASES) {
  for (const theme of THEMES) {
    test(`overlay ${overlay.id} ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'overlays-extra', { theme })
      await open(page, overlay)
      await expectShot(page, `overlay-${overlay.id}-${theme}.png`, { fullPage: true })
    })
  }
}

test.describe('dialog interaction states', () => {
  for (const theme of THEMES) {
    test(`dialog close button ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'overlays', { theme })
      await page.locator('[data-gallery-case="dialog-trigger"] button').click()
      await page.locator('[data-slot="dialog-content"]').waitFor({ state: 'visible' })
      await settle(page)

      // `DialogPrimitive.Close asChild` hands its props to a `Button`, whose own
      // `data-slot` wins the merge, so the corner button is addressed by position.
      const close = page.locator('[data-slot="dialog-content"] > button')
      await close.focus()
      await expectShot(page, `state-dialog-close-focus-${theme}.png`, { fullPage: true })

      await close.hover()
      await expectShot(page, `state-dialog-close-hover-${theme}.png`, { fullPage: true })
    })

    test(`dialog footer close button ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'overlays-extra', { theme })
      await page.locator('[data-gallery-case="dialog-footer-close-trigger"] button').click()
      await page.locator('[data-slot="dialog-footer"]').waitFor({ state: 'visible' })
      await settle(page)

      await page.locator('[data-slot="dialog-footer"] button').last().focus()
      await expectShot(page, `state-dialog-footer-close-focus-${theme}.png`, { fullPage: true })
    })

    test(`alert dialog action focus ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'overlays-extra', { theme })
      await page.locator('[data-gallery-case="alert-dialog-sm-media-trigger"] button').click()
      await page.locator('[data-slot="alert-dialog-content"]').waitFor({ state: 'visible' })
      await settle(page)

      await page.locator('[data-slot="alert-dialog-action"]').focus()
      await expectShot(page, `state-alert-dialog-action-focus-${theme}.png`, { fullPage: true })

      await page.locator('[data-slot="alert-dialog-cancel"]').focus()
      await expectShot(page, `state-alert-dialog-cancel-focus-${theme}.png`, { fullPage: true })
    })

    test(`dialog nested select open ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'overlays-extra', { theme })
      await page.locator('[data-gallery-case="dialog-nested-select-trigger"] button').click()
      await page.locator('[data-slot="dialog-content"]').waitFor({ state: 'visible' })
      await settle(page)

      await page.locator('[data-slot="select-trigger"]').click()
      await page.locator('[data-slot="select-content"]').waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `state-dialog-nested-select-${theme}.png`, { fullPage: true })
    })
  }
})

/**
 * Sheet and drawer states the list above does not reach (PR 11).
 *
 * The four sheet sides and the bottom/right drawer are already covered; these
 * add the left and top drawer directions, a sheet without its close button and
 * a body taller than the viewport. Full-page captures, because the content is
 * portalled to `document.body` and the overlay covers the whole viewport.
 */
test.describe('sheet and drawer edges', () => {
  const EXTRA_CASES: OverlayCase[] = [
    {
      id: 'sheet-right-no-close',
      trigger: '[data-gallery-case="sheet-right-no-close-trigger"] button',
      content: '[data-slot="sheet-content"]',
    },
    {
      id: 'sheet-left-no-close',
      trigger: '[data-gallery-case="sheet-left-no-close-trigger"] button',
      content: '[data-slot="sheet-content"]',
    },
    {
      id: 'sheet-right-long',
      trigger: '[data-gallery-case="sheet-right-long-trigger"] button',
      content: '[data-slot="sheet-content"]',
    },
    {
      id: 'sheet-bottom-long',
      trigger: '[data-gallery-case="sheet-bottom-long-trigger"] button',
      content: '[data-slot="sheet-content"]',
    },
    {
      id: 'drawer-left',
      trigger: '[data-gallery-case="drawer-left-trigger"] button',
      content: '[data-slot="drawer-content"]',
      jsMotion: true,
    },
    {
      id: 'drawer-top',
      trigger: '[data-gallery-case="drawer-top-trigger"] button',
      content: '[data-slot="drawer-content"]',
      jsMotion: true,
    },
    {
      id: 'drawer-bottom-long',
      trigger: '[data-gallery-case="drawer-bottom-long-trigger"] button',
      content: '[data-slot="drawer-content"]',
      jsMotion: true,
    },
  ]

  for (const overlay of EXTRA_CASES) {
    for (const theme of THEMES) {
      test(`overlay ${overlay.id} ${theme}`, async ({ page }) => {
        await gotoGallery(page, 'overlays-sheet-drawer', { theme })
        await open(page, overlay)
        await expectShot(page, `overlay-${overlay.id}-${theme}.png`, { fullPage: true })
      })
    }
  }
})

/**
 * Popover, tooltip and hover-card (PR 12).
 *
 * Each `side` is captured on its own: the four enter animations differ only in
 * which axis they slide along, and the content's `transform-origin` comes from
 * a Radix custom property that changes with the resolved side. The two
 * collision cases ask for the side that has no room, so the placement flips and
 * a *different* keyframe than the one the prop names runs.
 *
 * Full-page shots, because the content is portalled to `<body>` and sits
 * outside its trigger's case element.
 */
const FLOATING_CASES: OverlayCase[] = [
  ...(['top', 'right', 'bottom', 'left'] as const).flatMap((side) => [
    {
      id: `popover-side-${side}`,
      trigger: `[data-gallery-case="popover-side-${side}-trigger"] button`,
      content: '[data-slot="popover-content"]',
    },
    {
      id: `tooltip-side-${side}`,
      trigger: `[data-gallery-case="tooltip-side-${side}-target"] button`,
      content: '[data-slot="tooltip-content"]',
      openBy: 'hover' as const,
    },
  ]),
  {
    id: 'popover-collision-start',
    trigger: '[data-gallery-case="popover-collision-start-trigger"] button',
    content: '[data-slot="popover-content"]',
  },
  {
    id: 'popover-collision-end',
    trigger: '[data-gallery-case="popover-collision-end-trigger"] button',
    content: '[data-slot="popover-content"]',
  },
  {
    id: 'tooltip-long',
    trigger: '[data-gallery-case="tooltip-long-target"] button',
    content: '[data-slot="tooltip-content"]',
    openBy: 'hover',
  },
  {
    id: 'hover-card-side-right',
    trigger: '[data-gallery-case="hover-card-side-right-trigger"] button',
    content: '[data-slot="hover-card-content"]',
    openBy: 'hover',
  },
  {
    id: 'hover-card-rich',
    trigger: '[data-gallery-case="hover-card-rich-trigger"] button',
    content: '[data-slot="hover-card-content"]',
    openBy: 'hover',
  },
  {
    id: 'hover-card-collision-end',
    trigger: '[data-gallery-case="hover-card-collision-end-trigger"] button',
    content: '[data-slot="hover-card-content"]',
    openBy: 'hover',
  },
]

for (const floating of FLOATING_CASES) {
  for (const theme of THEMES) {
    test(`floating ${floating.id} ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'floating-extra', { theme })
      await open(page, floating)
      await expectShot(page, `floating-${floating.id}-${theme}.png`, { fullPage: true })
    })
  }
}

/**
 * The same three components opened from the keyboard, and dismissed (PR 12).
 *
 * A popover opens on Enter *and* on Space, moves focus into the content, and on
 * Escape closes and returns focus to its trigger — which is why the last shot
 * of each pair is taken after the dismissal: it shows the trigger's focus ring,
 * the only visible proof that focus came back. A tooltip has no focus of its
 * own; it opens because its trigger is focused.
 */
test.describe('floating keyboard', () => {
  for (const theme of THEMES) {
    test(`popover keyboard open and escape ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'floating-extra', { theme })

      const trigger = page.locator('[data-gallery-case="popover-keyboard-trigger"] button')
      await trigger.focus()
      await page.keyboard.press('Enter')
      await page.locator('[data-slot="popover-content"]').waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `floating-popover-keyboard-enter-${theme}.png`, { fullPage: true })

      await page.keyboard.press('Escape')
      await page.locator('[data-slot="popover-content"]').waitFor({ state: 'detached' })
      await settle(page)
      await expectShot(page, `floating-popover-keyboard-escape-${theme}.png`, { fullPage: true })

      await page.keyboard.press('Space')
      await page.locator('[data-slot="popover-content"]').waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `floating-popover-keyboard-space-${theme}.png`, { fullPage: true })
    })

    test(`tooltip keyboard focus ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'floating-extra', { theme })

      const trigger = page.locator('[data-gallery-case="tooltip-focus-target"] button')
      await trigger.focus()
      await page.locator('[data-slot="tooltip-content"]').waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `floating-tooltip-keyboard-focus-${theme}.png`, { fullPage: true })

      await page.keyboard.press('Escape')
      await page.locator('[data-slot="tooltip-content"]').waitFor({ state: 'detached' })
      await settle(page)
      await expectShot(page, `floating-tooltip-keyboard-escape-${theme}.png`, { fullPage: true })
    })
  }
})

/**
 * `menus-extra` (PR 13).
 *
 * `DropdownMenuContent` and `ContextMenuContent` live in a portal, so the
 * `menus-extra` gallery section only holds closed triggers and every open
 * state is captured here, full page. The states pinned are the ones the
 * `overlays` section never reaches: a focused item of each kind (Radix focuses
 * an item on pointer move, which is what paints `focus:bg-accent`), a focused
 * `destructive` item, `data-inset` items, an open submenu, all four
 * `data-[side]` placements — each one a different enter-animation offset — and
 * a context menu opened against the bottom edge of the viewport, where Radix
 * flips the side and recomputes the transform origin.
 */
test.describe('menus-extra', () => {
  const DROPDOWN_CONTENT = '[data-slot="dropdown-menu-content"]'
  const DROPDOWN_SUB_CONTENT = '[data-slot="dropdown-menu-sub-content"]'
  const CONTEXT_CONTENT = '[data-slot="context-menu-content"]'
  const CONTEXT_SUB_CONTENT = '[data-slot="context-menu-sub-content"]'

  /**
   * Scrolls the gallery's own scroll container until an element sits just above
   * the bottom edge of the viewport, so the collision case is anchored the same
   * way on every run. The layout nests two `<main>` elements; the inner, last
   * one scrolls (see `helpers.ts`).
   */
  async function parkAtViewportBottom(page: Page, selector: string): Promise<void> {
    await page.evaluate((sel) => {
      const element = document.querySelector(sel)
      const mains = document.querySelectorAll('main')
      const scroller = mains[mains.length - 1]
      if (!element || !scroller) return
      scroller.scrollTop += element.getBoundingClientRect().bottom - (window.innerHeight - 8)
    }, selector)
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))))
  }

  for (const theme of THEMES) {
    test(`dropdown rich menu ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'menus-extra', { theme })

      await page.locator('[data-gallery-case="menu-dropdown-rich"] button').click()
      await page.locator(DROPDOWN_CONTENT).waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `menus-extra-dropdown-rich-open-${theme}.png`, { fullPage: true })

      await page.keyboard.press('ArrowDown')
      await settle(page)
      await expectShot(page, `menus-extra-dropdown-rich-first-focus-${theme}.png`, {
        fullPage: true,
      })

      await page
        .locator(
          '[data-slot="dropdown-menu-item"][data-variant="destructive"]:not([data-disabled])'
        )
        .first()
        .hover()
      await settle(page)
      await expectShot(page, `menus-extra-dropdown-rich-destructive-focus-${theme}.png`, {
        fullPage: true,
      })

      await page.locator('[data-slot="dropdown-menu-checkbox-item"]').first().hover()
      await settle(page)
      await expectShot(page, `menus-extra-dropdown-rich-checkbox-focus-${theme}.png`, {
        fullPage: true,
      })

      await page.locator('[data-slot="dropdown-menu-sub-trigger"]').hover()
      await page.locator(DROPDOWN_SUB_CONTENT).waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `menus-extra-dropdown-rich-submenu-${theme}.png`, { fullPage: true })

      await page.keyboard.press('ArrowRight')
      await settle(page)
      await expectShot(page, `menus-extra-dropdown-rich-submenu-focus-${theme}.png`, {
        fullPage: true,
      })
    })

    test(`dropdown keyboard open ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'menus-extra', { theme })

      await page.locator('[data-gallery-case="menu-dropdown-rich"] button').focus()
      await page.keyboard.press('Enter')
      await page.locator(DROPDOWN_CONTENT).waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `menus-extra-dropdown-keyboard-open-${theme}.png`, { fullPage: true })
    })

    test(`dropdown inset menu ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'menus-extra', { theme })

      await page.locator('[data-gallery-case="menu-dropdown-inset"] button').click()
      await page.locator(DROPDOWN_CONTENT).waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `menus-extra-dropdown-inset-open-${theme}.png`, { fullPage: true })

      await page.locator('[data-slot="dropdown-menu-sub-trigger"]').hover()
      await page.locator(DROPDOWN_SUB_CONTENT).waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `menus-extra-dropdown-inset-submenu-${theme}.png`, { fullPage: true })
    })

    for (const side of ['top', 'right', 'bottom', 'left'] as const) {
      test(`dropdown side ${side} ${theme}`, async ({ page }) => {
        await gotoGallery(page, 'menus-extra', { theme })

        await page.locator(`[data-gallery-case="menu-dropdown-side-${side}"] button`).click()
        await page.locator(DROPDOWN_CONTENT).waitFor({ state: 'visible' })
        await settle(page)
        await expectShot(page, `menus-extra-dropdown-side-${side}-${theme}.png`, { fullPage: true })
      })
    }

    test(`context menu rich ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'menus-extra', { theme })

      await page
        .locator('[data-gallery-case="menu-context-rich"] [data-slot="context-menu-trigger"]')
        .click({ button: 'right' })
      await page.locator(CONTEXT_CONTENT).waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `menus-extra-context-rich-open-${theme}.png`, { fullPage: true })

      await page.keyboard.press('ArrowDown')
      await settle(page)
      await expectShot(page, `menus-extra-context-rich-first-focus-${theme}.png`, {
        fullPage: true,
      })

      await page
        .locator('[data-slot="context-menu-item"][data-variant="destructive"]:not([data-disabled])')
        .first()
        .hover()
      await settle(page)
      await expectShot(page, `menus-extra-context-rich-destructive-focus-${theme}.png`, {
        fullPage: true,
      })

      await page.locator('[data-slot="context-menu-sub-trigger"]').hover()
      await page.locator(CONTEXT_SUB_CONTENT).waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `menus-extra-context-rich-submenu-${theme}.png`, { fullPage: true })
    })

    test(`context menu viewport edge ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'menus-extra', { theme })

      const trigger = page.locator(
        '[data-gallery-case="menu-context-edge"] [data-slot="context-menu-trigger"]'
      )
      await trigger.scrollIntoViewIfNeeded()
      await parkAtViewportBottom(
        page,
        '[data-gallery-case="menu-context-edge"] [data-slot="context-menu-trigger"]'
      )

      const box = await trigger.boundingBox()
      if (!box) throw new Error('context menu collision trigger has no box')
      await page.mouse.click(box.x + box.width - 4, box.y + box.height - 4, { button: 'right' })
      await page.locator(CONTEXT_CONTENT).waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `menus-extra-context-edge-open-${theme}.png`, { fullPage: true })

      await page.locator('[data-slot="context-menu-sub-trigger"]').hover()
      await page.locator(CONTEXT_SUB_CONTENT).waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `menus-extra-context-edge-submenu-${theme}.png`, { fullPage: true })
    })
  }
})

/**
 * Menubar and navigation-menu open states (PR 14).
 *
 * Appended as a new block rather than added to `OVERLAY_CASES`, so every name
 * here is new and no frozen original moves. Each name carries `menubar-nav`,
 * which is what selects this row's cases with `-g menubar-nav`.
 *
 * The navigation-menu panels settle through `waitForStable`: the viewport sizes
 * itself from a `ResizeObserver` and publishes the result as
 * `--radix-navigation-menu-viewport-{width,height}`, which the element then
 * transitions to over its own 100ms.
 */
test.describe('menubar-nav open states', () => {
  for (const theme of THEMES) {
    test(`overlay menubar-nav bar-file-menu ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'menubar-nav-extra', { theme })
      await page
        .locator('[data-gallery-case="menubar-nav-bar-rich"] [data-slot="menubar-trigger"]')
        .first()
        .click()
      await page.locator('[data-slot="menubar-content"]').waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `overlay-menubar-nav-bar-file-menu-${theme}.png`, { fullPage: true })
    })

    test(`overlay menubar-nav bar-submenu ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'menubar-nav-extra', { theme })
      await page
        .locator('[data-gallery-case="menubar-nav-bar-rich"] [data-slot="menubar-trigger"]')
        .first()
        .click()
      await page.locator('[data-slot="menubar-content"]').waitFor({ state: 'visible' })
      await page.locator('[data-slot="menubar-sub-trigger"]').hover()
      await page.locator('[data-slot="menubar-sub-content"]').waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `overlay-menubar-nav-bar-submenu-${theme}.png`, { fullPage: true })
    })

    test(`overlay menubar-nav nav-viewport-panel ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'menubar-nav-extra', { theme })
      await page
        .locator(
          '[data-gallery-case="menubar-nav-nav-viewport"] [data-slot="navigation-menu-trigger"]'
        )
        .first()
        .click()
      await page.locator('[data-slot="navigation-menu-viewport"]').waitFor({ state: 'visible' })
      await waitForStable(page, '[data-slot="navigation-menu-viewport"]')
      await settle(page)
      await expectShot(page, `overlay-menubar-nav-nav-viewport-panel-${theme}.png`, {
        fullPage: true,
      })
    })

    test(`overlay menubar-nav nav-no-viewport-panel ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'menubar-nav-extra', { theme })
      await page
        .locator(
          '[data-gallery-case="menubar-nav-nav-no-viewport"] [data-slot="navigation-menu-trigger"]'
        )
        .first()
        .click()
      await page.locator('[data-slot="navigation-menu-content"]').waitFor({ state: 'visible' })
      await waitForStable(page, '[data-slot="navigation-menu-content"]')
      await settle(page)
      await expectShot(page, `overlay-menubar-nav-nav-no-viewport-panel-${theme}.png`, {
        fullPage: true,
      })
    })
  }
})

/**
 * `select-combobox-extra` (PR 15).
 *
 * Both popups are portalled, so every case here is a full-page capture. They
 * cover what the closed triggers cannot show: the item-aligned and the popper
 * geometry, groups, labels, separators, a disabled item, the checked item's
 * indicator, the scroll buttons, a clamped long option, and the combobox's
 * filtered, empty, highlighted and multi-select states.
 */
test.describe('selcombo popups', () => {
  const SECTION = 'select-combobox-extra'

  async function openSelect(page: Page, caseName: string): Promise<void> {
    const trigger = page.locator(`[data-gallery-case="${caseName}"] [data-slot="select-trigger"]`)
    await trigger.scrollIntoViewIfNeeded()
    await trigger.click()
    await page.locator('[data-slot="select-content"]').first().waitFor({ state: 'visible' })
    await settle(page)
  }

  async function openCombobox(page: Page, caseName: string): Promise<void> {
    const input = page.locator(`[data-gallery-case="${caseName}"] input`).first()
    await input.scrollIntoViewIfNeeded()
    await input.click()
    await page.locator('[data-slot="combobox-content"]').first().waitFor({ state: 'visible' })
    await settle(page)
  }

  for (const theme of THEMES) {
    test(`selcombo select groups open ${theme}`, async ({ page }) => {
      await gotoGallery(page, SECTION, { theme })
      await openSelect(page, 'selcombo-select-groups')
      await expectShot(page, `selcombo-select-groups-${theme}.png`, { fullPage: true })

      await page.keyboard.press('ArrowDown')
      await settle(page)
      await expectShot(page, `selcombo-select-groups-arrow-${theme}.png`, { fullPage: true })
    })

    test(`selcombo select popper open ${theme}`, async ({ page }) => {
      await gotoGallery(page, SECTION, { theme })
      await openSelect(page, 'selcombo-select-popper')
      await expectShot(page, `selcombo-select-popper-${theme}.png`, { fullPage: true })
    })

    test(`selcombo select scroll open ${theme}`, async ({ page }) => {
      await gotoGallery(page, SECTION, { theme })
      await openSelect(page, 'selcombo-select-scroll')
      await expectShot(page, `selcombo-select-scroll-${theme}.png`, { fullPage: true })
    })

    test(`selcombo select long open ${theme}`, async ({ page }) => {
      await gotoGallery(page, SECTION, { theme })
      await openSelect(page, 'selcombo-select-long')
      await expectShot(page, `selcombo-select-long-${theme}.png`, { fullPage: true })
    })

    test(`selcombo combobox list open ${theme}`, async ({ page }) => {
      await gotoGallery(page, SECTION, { theme })
      await openCombobox(page, 'selcombo-combobox-list')
      await expectShot(page, `selcombo-combobox-list-${theme}.png`, { fullPage: true })

      await page.keyboard.press('ArrowDown')
      await settle(page)
      await expectShot(page, `selcombo-combobox-highlighted-${theme}.png`, { fullPage: true })
    })

    test(`selcombo combobox filtered ${theme}`, async ({ page }) => {
      await gotoGallery(page, SECTION, { theme })
      const input = page.locator('[data-gallery-case="selcombo-combobox-list"] input').first()
      await input.scrollIntoViewIfNeeded()
      await input.click()
      await input.fill('co')
      await page.locator('[data-slot="combobox-content"]').first().waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `selcombo-combobox-filtered-${theme}.png`, { fullPage: true })

      await input.fill('zzzz')
      await settle(page)
      await expectShot(page, `selcombo-combobox-empty-${theme}.png`, { fullPage: true })
    })

    test(`selcombo combobox chips open ${theme}`, async ({ page }) => {
      await gotoGallery(page, SECTION, { theme })
      await openCombobox(page, 'selcombo-combobox-chips')
      await expectShot(page, `selcombo-combobox-chips-open-${theme}.png`, { fullPage: true })
    })

    test(`selcombo combobox clear ${theme}`, async ({ page }) => {
      await gotoGallery(page, SECTION, { theme })
      const clear = page.locator(
        '[data-gallery-case="selcombo-combobox-clear"] [data-slot="combobox-clear"]'
      )
      await clear.scrollIntoViewIfNeeded()
      await clear.click()
      await settle(page)
      await expectShot(page, `selcombo-combobox-cleared-${theme}.png`, { fullPage: true })
    })
  }
})

/**
 * `CommandDialog` (PR 16).
 *
 * The palette renders into the dialog portal, so no element screenshot of the
 * `command-calendar-extra` section ever holds it. It is also the one caller in
 * the codebase that overrides half of `DialogContent`'s `translate` pair, and
 * the only place where `CommandItem`'s `in-data-[slot=dialog-content]:rounded-lg!`
 * applies — both of which only exist while the dialog is open.
 */
/**
 * The palette lives in the dialog portal, and the section behind it renders
 * four more of them, so every locator inside these two tests is scoped to the
 * open panel.
 */
const DIALOG = '[data-slot="dialog-content"]'

test.describe('command-calendar-extra overlays', () => {
  for (const theme of THEMES) {
    test(`cmdcal command dialog open ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'command-calendar-extra', { theme })

      await page.locator('[data-gallery-case="cmdcal-command-dialog-trigger"] button').click()
      await page.locator('[data-slot="dialog-content"]').waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `cmdcal-command-dialog-open-${theme}.png`, { fullPage: true })

      await page.keyboard.press('ArrowDown')
      await settle(page)
      await expectShot(page, `cmdcal-command-dialog-arrow-down-${theme}.png`, { fullPage: true })

      await page.locator(`${DIALOG} [data-slot="command-input"]`).fill('summ')
      await settle(page)
      await expectShot(page, `cmdcal-command-dialog-filtered-${theme}.png`, { fullPage: true })

      await page.locator(`${DIALOG} [data-slot="command-input"]`).fill('zzzz')
      await settle(page)
      await expectShot(page, `cmdcal-command-dialog-empty-${theme}.png`, { fullPage: true })
    })

    test(`cmdcal command dialog item hover ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'command-calendar-extra', { theme })

      await page.locator('[data-gallery-case="cmdcal-command-dialog-trigger"] button').click()
      await page.locator('[data-slot="dialog-content"]').waitFor({ state: 'visible' })
      await settle(page)

      // Only an enabled item can be hovered: a disabled one carries
      // `pointer-events: none`, so it is never an actionable target. Its
      // dimmed state is in every other shot of this panel.
      await page.locator(`${DIALOG} [data-slot="command-item"]`).nth(1).hover()
      await settle(page)
      await expectShot(page, `cmdcal-command-dialog-item-hover-${theme}.png`, { fullPage: true })
    })
  }
})

/**
 * The two `CreateSkillDialog` states no existing original reaches (PR 23).
 *
 * `app-dialog-create-skill-*` already freezes the empty form, so what is left
 * is a filled one — a tag row inside the dialog's grid, added with the keyboard
 * — and the mutation error paragraph, which only renders after a submit has
 * failed. The failure comes from the `error` fixture mode, which 500s every
 * endpoint.
 *
 * The error case is an **element** shot of the dialog content rather than a
 * full page: `useCreateSkill` also raises a toast on failure, and that toast
 * dismisses itself on a timer the capture would race.
 */
test.describe('skillsx dialogs', () => {
  for (const theme of THEMES) {
    test(`skillsx create dialog filled ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'app-dialogs', { theme })
      await page.locator('[data-gallery-case="open-create-skill"] button').click()
      await page.locator('[data-slot="dialog-content"]').waitFor({ state: 'visible' })

      await page.locator('#skill-name').fill('draft-release-notes')
      await page.locator('#skill-description').fill('Drafts release notes from a changelog.')
      const tags = page.locator('#skill-tags')
      await tags.fill('release')
      await tags.press('Enter')
      await tags.fill('changelog')
      await tags.press('Enter')
      await settle(page)
      await expectShot(page, `skillsx-create-dialog-filled-${theme}.png`, { fullPage: true })
    })

    test(`skillsx create dialog error ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'app-dialogs', { theme, data: 'error' })
      await page.locator('[data-gallery-case="open-create-skill"] button').click()
      await page.locator('[data-slot="dialog-content"]').waitFor({ state: 'visible' })

      await page.locator('#skill-name').fill('draft-release-notes')
      await page.getByRole('button', { name: 'Create skill' }).click()
      const content = page.locator('[data-slot="dialog-content"]')
      await content.getByText('Fixture runtime is unavailable.').waitFor({ state: 'visible' })
      await expectShot(content, `skillsx-create-dialog-error-${theme}.png`)
    })
  }
})

/**
 * Project dialog states the `app-dialogs` section does not reach (PR 24),
 * appended as a new block so no existing test name or original moves.
 *
 * `rename-project-empty` is the rename dialog's validation state: `Save` is
 * disabled while the name is blank. `add-project-long-error` pairs the error
 * paragraph with a pending submit button and a message long enough to wrap.
 */
const PROJECTSX_DIALOGS = [
  'projectsx-add-project-long-error',
  'projectsx-rename-project-empty',
  'projectsx-delete-project-long-name',
  'projectsx-delete-project-pending',
]

for (const dialog of PROJECTSX_DIALOGS) {
  for (const theme of THEMES) {
    test(`projectsx dialog ${dialog} ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'projects-extra', { theme })
      await page.locator(`[data-gallery-case="open-${dialog}"] button`).click()
      await page.locator('[data-slot="dialog-content"]').waitFor({ state: 'visible' })
      await settle(page)
      await expectShot(page, `projectsx-dialog-${dialog}-${theme}.png`, { fullPage: true })
    })
  }
}

test.describe('projectsx dialog focus states', () => {
  for (const theme of THEMES) {
    test(`projectsx add project field states ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'projects-extra', { theme })
      await page
        .locator('[data-gallery-case="open-projectsx-add-project-long-error"] button')
        .click()
      await page.locator('[data-slot="dialog-content"]').waitFor({ state: 'visible' })
      await settle(page)

      const field = page.locator(`${DIALOG} #project-path`)
      await field.focus()
      await settle(page)
      await expectShot(page, `projectsx-dialog-add-project-input-focus-${theme}.png`, {
        fullPage: true,
      })

      await field.fill('/Users/fixture/projects/new-one')
      await settle(page)
      await expectShot(page, `projectsx-dialog-add-project-input-filled-${theme}.png`, {
        fullPage: true,
      })
    })

    test(`projectsx rename validation ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'projects-extra', { theme })
      await page.locator('[data-gallery-case="open-projectsx-rename-project-empty"] button').click()
      await page.locator('[data-slot="dialog-content"]').waitFor({ state: 'visible' })
      await settle(page)

      const field = page.locator(`${DIALOG} #rename-input`)
      await field.focus()
      await settle(page)
      await expectShot(page, `projectsx-dialog-rename-input-focus-${theme}.png`, {
        fullPage: true,
      })

      await field.fill('Renamed Project')
      await settle(page)
      await expectShot(page, `projectsx-dialog-rename-enabled-${theme}.png`, { fullPage: true })
    })
  }
})

/**
 * `carousel-toaster-extra` toasts (PR 19).
 *
 * `<Toaster />` is mounted next to the router in `App.tsx`, so it is present on
 * every gallery section; each toast renders into a fixed `[data-sileo-viewport]`
 * of its own, outside the case element. The captures are therefore full page,
 * like every other portalled overlay in this file.
 *
 * Sileo animates with `motion` springs — JavaScript, not CSS — so
 * `animations: 'disabled'` cannot fast-forward them and every case waits for
 * the toast's box and transform to stop changing first. The gallery triggers
 * pin Sileo's three wall-clock timers (see the section file); nothing here
 * depends on when the capture happens.
 */
test.describe('cartoast toaster', () => {
  const TOAST = '[data-sileo-toast]'

  const showToast = async (page: Page, caseName: string) => {
    await page.locator(`[data-gallery-case="${caseName}"] button`).click()
    // Sileo expands a hovered toast, and the `bottom-center` case puts one
    // right under the pointer that just clicked its trigger. Parking the mouse
    // in the corner keeps every case on the timeline its options pin.
    await page.mouse.move(0, 0)
    await page.locator(TOAST).waitFor({ state: 'visible' })
    await waitForStable(page, TOAST)
    // The toast's outer box settles well before the two rects inside it do.
    // Sileo draws the header as a pill and the body as a second rounded rect
    // and merges them with an SVG gooey filter, and the pill's own spring is
    // what decides the notch where the two meet — invisible to a wait on the
    // toast, and the reason a `bottom-center` toast differed from its original
    // on one mobile run in four.
    await waitForStable(page, '[data-sileo-pill]')
    // ...and the badge is sprung independently of the pill it sits in.
    await waitForStable(page, '[data-sileo-badge]')
    // The last thing to settle is the one element none of the three above can
    // stand in for. Sileo merges the pill and the body with an SVG gooey
    // filter, drawn into `[data-sileo-canvas]`, and that canvas is sized from
    // its own spring: it passes through 85.5 → 88.9 → 90.15 and lands on 90
    // about 400ms after the toast appears, *after* the toast, the pill and the
    // badge have all stopped. A capture taken in between gets a 92px canvas,
    // which moves the filter's sampling grid and re-antialiases every edge
    // inside the filtered group — including the badge's icon, which is exactly
    // where the `bottom-center` case differed from its original by ~20 pixels
    // of at most 6/255. The difference is invisible to a wait on any part the
    // filter draws, because none of them moves; only the surface does.
    await waitForStable(page, '[data-sileo-canvas]')
    await waitForAnimationsToFinish(page)
    await settle(page)
  }

  for (const theme of THEMES) {
    test(`cartoast toaster single ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'carousel-toaster-extra', { theme })
      await showToast(page, 'cartoast-toast-single-trigger')
      await expectShot(page, `cartoast-toaster-single-${theme}.png`, { fullPage: true })
    })

    // Three `toast.*` calls in a row do not stack into three elements: Sileo
    // keeps one toast on screen and morphs its header and body through to the
    // last one. The settled result is the third toast, which is what this
    // pins — together with the fact that there is exactly one.
    test(`cartoast toaster stack ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'carousel-toaster-extra', { theme })
      await showToast(page, 'cartoast-toast-stack-trigger')
      await expect(page.locator(TOAST)).toHaveCount(1)
      await expectShot(page, `cartoast-toaster-stack-${theme}.png`, { fullPage: true })
    })

    test(`cartoast toaster pill ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'carousel-toaster-extra', { theme })
      await showToast(page, 'cartoast-toast-pill-trigger')
      await expectShot(page, `cartoast-toaster-pill-${theme}.png`, { fullPage: true })
    })

    for (const variant of ['success', 'error', 'warning', 'info', 'action'] as const) {
      test(`cartoast toaster ${variant} ${theme}`, async ({ page }) => {
        await gotoGallery(page, 'carousel-toaster-extra', { theme })
        await showToast(page, `cartoast-toast-${variant}-trigger`)
        await expectShot(page, `cartoast-toaster-${variant}-${theme}.png`, { fullPage: true })
      })
    }

    test(`cartoast toaster placement ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'carousel-toaster-extra', { theme })
      await showToast(page, 'cartoast-toast-placement-trigger')
      await expectShot(page, `cartoast-toaster-placement-${theme}.png`, { fullPage: true })
    })

    test(`cartoast toaster button focus ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'carousel-toaster-extra', { theme })
      await showToast(page, 'cartoast-toast-button-trigger')
      await expectShot(page, `cartoast-toaster-button-${theme}.png`, { fullPage: true })

      await page.locator('[data-sileo-button]').focus()
      await settle(page)
      await expectShot(page, `cartoast-toaster-button-focus-${theme}.png`, { fullPage: true })
    })

    // Sileo renders no close control and ignores a click on the toast body, so
    // the action button calling `toast.dismiss(id)` is the only way out.
    test(`cartoast toaster dismiss ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'carousel-toaster-extra', { theme })
      await showToast(page, 'cartoast-toast-button-trigger')

      await page.locator('[data-sileo-button]').click()
      await page.locator(TOAST).waitFor({ state: 'detached' })
      await settle(page)
      await expectShot(page, `cartoast-toaster-dismissed-${theme}.png`, { fullPage: true })
    })
  }
})
