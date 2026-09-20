import { test, type Page } from '@playwright/test'
import { expectCaseShot, expectShot, gotoGallery, settle, THEMES, waitForStable } from './helpers'

/**
 * Sections mirror `src/visual-gallery/sections/index.ts`. Case names are read
 * from the DOM, so adding a gallery case in a later PR automatically requires a
 * new original instead of silently going uncovered.
 */
const SECTIONS = [
  'typography',
  'typography-extra',
  'buttons',
  'forms',
  'data-display',
  'disclosure',
  'overlays',
  'sidebar-parts',
  'app',
  'app-dialogs',
  'canary',
  'tokens',
] as const

async function caseNames(page: Page): Promise<string[]> {
  return page
    .locator('[data-gallery-case]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-gallery-case') ?? ''))
}

for (const section of SECTIONS) {
  for (const theme of THEMES) {
    test(`gallery ${section} ${theme}`, async ({ page }) => {
      await gotoGallery(page, section, { theme })
      await expectShot(page, `gallery-${section}-${theme}.png`, { fullPage: true })

      for (const name of await caseNames(page)) {
        await expectCaseShot(page, name, `case-${section}-${name}-${theme}.png`)
      }
    })
  }
}

test.describe('interaction states', () => {
  for (const theme of THEMES) {
    test(`button hover focus active ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'buttons', { theme })

      await page.locator('[data-gallery-case="button-hover-target"] button').hover()
      await expectCaseShot(page, 'button-hover-target', `state-button-hover-${theme}.png`)

      await page.locator('[data-gallery-case="button-focus-target"] button').focus()
      await expectCaseShot(page, 'button-focus-target', `state-button-focus-${theme}.png`)

      const active = page.locator('[data-gallery-case="button-default"] button')
      const box = await active.boundingBox()
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.mouse.down()
        await expectCaseShot(page, 'button-default', `state-button-active-${theme}.png`)
        await page.mouse.up()
      }

      await page.locator('[data-gallery-case="toggle-off"] button').hover()
      await expectCaseShot(page, 'toggle-off', `state-toggle-hover-${theme}.png`)
    })

    test(`form focus states ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'forms', { theme })

      await page.locator('[data-gallery-case="input-focus-target"] input').focus()
      await expectCaseShot(page, 'input-focus-target', `state-input-focus-${theme}.png`)

      await page.locator('[data-gallery-case="checkbox-focus-target"] button').focus()
      await expectCaseShot(page, 'checkbox-focus-target', `state-checkbox-focus-${theme}.png`)

      await page.locator('[data-gallery-case="textarea-empty"] textarea').focus()
      await expectCaseShot(page, 'textarea-empty', `state-textarea-focus-${theme}.png`)

      await page.locator('[data-gallery-case="switch-off"] button').focus()
      await expectCaseShot(page, 'switch-off', `state-switch-focus-${theme}.png`)

      await page.locator('[data-gallery-case="slider-single"] [data-slot="slider-thumb"]').focus()
      await expectCaseShot(page, 'slider-single', `state-slider-focus-${theme}.png`)
    })

    test(`disclosure interactions ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'disclosure', { theme })

      await page
        .locator('[data-gallery-case="tabs-default"] [data-slot="tabs-trigger"]')
        .nth(1)
        .click()
      await settle(page)
      await expectCaseShot(page, 'tabs-default', `state-tabs-second-${theme}.png`)

      await page
        .locator('[data-gallery-case="collapsible-closed"] [data-slot="collapsible-trigger"]')
        .click()
      await settle(page)
      await expectCaseShot(page, 'collapsible-closed', `state-collapsible-opened-${theme}.png`)

      await page
        .locator('[data-gallery-case="accordion-collapsed"] [data-slot="accordion-trigger"]')
        .first()
        .click()
      await settle(page)
      await expectCaseShot(page, 'accordion-collapsed', `state-accordion-opened-${theme}.png`)

      await page
        .locator('[data-gallery-case="carousel-default"] [data-slot="carousel-next"]')
        .click()
      await waitForStable(
        page,
        '[data-gallery-case="carousel-default"] [data-slot="carousel-item"]'
      )
      await settle(page)
      await expectCaseShot(page, 'carousel-default', `state-carousel-second-${theme}.png`)
    })

    // The StyleX canary's hover rule is nested in `@media (hover: hover)`, the
    // same shape Tailwind v4 uses, so it only applies to a real pointer hover.
    test(`canary hover ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'canary', { theme })

      await page.locator('[data-gallery-case="canary-hover"] [data-slot="canary"]').hover()
      await expectCaseShot(page, 'canary-hover', `state-canary-hover-${theme}.png`)
    })

    // The suggestion list is absolutely positioned, so it falls outside the case
    // element's box; this one is captured full page instead.
    test(`tags input interactions ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'app', { theme })

      const tagsInput = page.locator('[data-gallery-case="tags-input-empty"] input')
      await tagsInput.focus()
      await tagsInput.fill('git')
      await page.locator('[data-gallery-case="tags-input-empty"] ul').waitFor({ state: 'visible' })
      await expectShot(page, `state-tags-input-suggestions-${theme}.png`, { fullPage: true })
    })
  }
})
