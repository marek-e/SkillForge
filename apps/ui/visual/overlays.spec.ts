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
