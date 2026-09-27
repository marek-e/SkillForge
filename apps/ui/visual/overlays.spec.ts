import { test, type Page } from '@playwright/test'
import { expectShot, gotoGallery, gotoRoute, settle, THEMES, waitForStable } from './helpers'

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
