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
