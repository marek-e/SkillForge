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
  'buttons-extra',
  'forms',
  'forms-extra',
  'forms-toggles',
  'data-display',
  'data-display-extra',
  'disclosure',
  'disclosure-extra',
  'feedback',
  'overlays',
  'overlays-extra',
  'sidebar-parts',
  'app',
  'app-dialogs',
  'canary',
  'tokens',
  'overlays-sheet-drawer',
  'floating-extra',
  'menus-extra',
  'menubar-nav-extra',
  'select-combobox-extra',
  'command-calendar-extra',
  'nav-bits-extra',
  'tools-filters-extra',
  'skills-extra',
  'projects-extra',
] as const

const BUTTON_VARIANTS = ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'] as const

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

    // Every variant's hover and focus state. The focus ring composes a
    // different colour for `destructive`, and on an `aria-invalid` button the
    // ring and the border colour are contested by two rules of equal
    // specificity, so the outcome is pinned rather than reasoned about.
    test(`button variant states ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'buttons-extra', { theme })

      for (const variant of BUTTON_VARIANTS) {
        const hoverCase = `button-hover-${variant}-target`
        await page.locator(`[data-gallery-case="${hoverCase}"] button`).hover()
        await expectCaseShot(page, hoverCase, `state-button-hover-${variant}-${theme}.png`)

        const focusCase = `button-focus-${variant}-target`
        await page.locator(`[data-gallery-case="${focusCase}"] button`).focus()
        await expectCaseShot(page, focusCase, `state-button-focus-${variant}-${theme}.png`)
        await page.locator(`[data-gallery-case="${focusCase}"] button`).blur()
      }

      await page.locator('[data-gallery-case="button-invalid-focus-target"] button').focus()
      await expectCaseShot(
        page,
        'button-invalid-focus-target',
        `state-button-invalid-focus-${theme}.png`
      )
      await page.locator('[data-gallery-case="button-invalid-focus-target"] button').blur()

      const active = page.locator('[data-gallery-case="button-active-target"] button')
      const activeBox = await active.boundingBox()
      if (activeBox) {
        await page.mouse.move(activeBox.x + activeBox.width / 2, activeBox.y + activeBox.height / 2)
        await page.mouse.down()
        await expectCaseShot(
          page,
          'button-active-target',
          `state-button-active-secondary-${theme}.png`
        )
        await page.mouse.up()
      }
    })

    test(`badge toggle and switch states ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'buttons-extra', { theme })

      await page.locator('[data-gallery-case="badge-hover-target"] a').hover()
      await expectCaseShot(page, 'badge-hover-target', `state-badge-hover-${theme}.png`)

      await page.locator('[data-gallery-case="badge-hover-ghost-target"] a').hover()
      await expectCaseShot(page, 'badge-hover-ghost-target', `state-badge-hover-ghost-${theme}.png`)

      await page.locator('[data-gallery-case="badge-focus-target"] a').focus()
      await expectCaseShot(page, 'badge-focus-target', `state-badge-focus-${theme}.png`)

      await page.locator('[data-gallery-case="toggle-focus-target"] button').focus()
      await expectCaseShot(page, 'toggle-focus-target', `state-toggle-focus-${theme}.png`)

      await page
        .locator('[data-gallery-case="display-view-switch-hover-target"] button')
        .last()
        .hover()
      await expectCaseShot(
        page,
        'display-view-switch-hover-target',
        `state-view-switch-hover-${theme}.png`
      )
    })

    // `forms-extra` (PR 05). Focus is what the input, textarea and input-group
    // rings are for, and an `aria-invalid` control is focused as well, because
    // the invalid ring and the focus ring are written by two rules of equal
    // specificity whose order decides the colour. The input-group button case
    // also pins the ring a focused `InputGroupButton` paints through its own
    // shadow reset.
    test(`form extra focus states ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'forms-extra', { theme })

      const focusTargets = [
        ['input-invalid-focus-target', 'input'],
        ['input-readonly-focus-target', 'input'],
        ['textarea-invalid-focus-target', 'textarea'],
        ['input-group-focus-target', 'input'],
        ['input-group-invalid-focus-target', 'input'],
        ['input-group-button-focus-target', 'button'],
      ] as const

      for (const [caseName, selector] of focusTargets) {
        const target = page.locator(`[data-gallery-case="${caseName}"] ${selector}`)
        await target.focus()
        await expectCaseShot(
          page,
          caseName,
          `state-${caseName.replace(/-target$/, '')}-${theme}.png`
        )
        await target.blur()
      }

      await page.locator('[data-gallery-case="field-description-link-hover-target"] a').hover()
      await expectCaseShot(
        page,
        'field-description-link-hover-target',
        `state-field-description-link-hover-${theme}.png`
      )
    })

    // `forms-toggles` (PR 06). Hover, focus and the active state of a slider
    // thumb are the only pointer states these four components have, and the
    // checkbox/radio/switch focus rings are contested by their `aria-invalid`
    // rules, so each combination is captured rather than reasoned about.
    test(`form toggle states ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'forms-toggles', { theme })

      await page.locator('[data-gallery-case="checkbox-hover-target"] button').hover()
      await expectCaseShot(page, 'checkbox-hover-target', `state-checkbox-hover-${theme}.png`)

      // Explicit snapshot names: `switch-focus-target` would otherwise derive
      // `state-switch-focus`, which PR 00 already uses for the `switch-off`
      // case of the `forms` section.
      const focusTargets = [
        ['checkbox-invalid-focus-target', 'state-checkbox-invalid-focus'],
        ['checkbox-checked-focus-target', 'state-checkbox-checked-focus'],
        ['switch-focus-target', 'state-switch-unchecked-focus'],
        ['switch-checked-focus-target', 'state-switch-checked-focus'],
        ['switch-invalid-focus-target', 'state-switch-invalid-focus'],
      ] as const

      for (const [caseName, snapshot] of focusTargets) {
        const target = page.locator(`[data-gallery-case="${caseName}"] button`)
        await target.focus()
        await expectCaseShot(page, caseName, `${snapshot}-${theme}.png`)
        await target.blur()
      }

      await page.locator('[data-gallery-case="radio-group-hover-target"] button').hover()
      await expectCaseShot(page, 'radio-group-hover-target', `state-radio-hover-${theme}.png`)

      const radio = page.locator('[data-gallery-case="radio-group-focus-target"] button')
      await radio.focus()
      await expectCaseShot(page, 'radio-group-focus-target', `state-radio-focus-${theme}.png`)
      await radio.blur()

      await page
        .locator('[data-gallery-case="slider-hover-target"] [data-slot="slider-thumb"]')
        .hover()
      await expectCaseShot(page, 'slider-hover-target', `state-slider-hover-${theme}.png`)

      const secondThumb = page
        .locator('[data-gallery-case="slider-range-focus-target"] [data-slot="slider-thumb"]')
        .nth(1)
      await secondThumb.focus()
      await expectCaseShot(
        page,
        'slider-range-focus-target',
        `state-slider-range-focus-${theme}.png`
      )
      await secondThumb.blur()

      const activeThumb = page
        .locator('[data-gallery-case="slider-active-target"] [data-slot="slider-thumb"]')
        .first()
      const thumbBox = await activeThumb.boundingBox()
      if (thumbBox) {
        await page.mouse.move(thumbBox.x + thumbBox.width / 2, thumbBox.y + thumbBox.height / 2)
        await page.mouse.down()
        await expectCaseShot(page, 'slider-active-target', `state-slider-active-${theme}.png`)
        await page.mouse.up()
      }

      // Keyboard: the space bar checks the hovered checkbox, and an arrow key
      // moves the focused thumb by one step.
      const spaceTarget = page.locator('[data-gallery-case="checkbox-hover-target"] button')
      await spaceTarget.focus()
      await page.keyboard.press('Space')
      await settle(page)
      await expectCaseShot(
        page,
        'checkbox-hover-target',
        `state-checkbox-space-checked-${theme}.png`
      )
      await spaceTarget.blur()

      const stepThumb = page
        .locator('[data-gallery-case="slider-step"] [data-slot="slider-thumb"]')
        .first()
      await stepThumb.focus()
      await page.keyboard.press('ArrowRight')
      await settle(page)
      await expectCaseShot(page, 'slider-step', `state-slider-arrow-right-${theme}.png`)
      await stepThumb.blur()
    })

    // `data-display-extra` (PR 07). A table row is the only hover rule in this
    // row's four components, and a *selected* row is hovered as well, because
    // `hover:bg-muted/50` and `data-[state=selected]:bg-muted` have the same
    // specificity and Tailwind settles them by emission order. The card hover
    // target pins the caller-supplied ring a `Card` composes from its own
    // `ring-1`.
    test(`table and card hover states ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'data-display-extra', { theme })

      const rows = page.locator('[data-gallery-case="table-row-hover-target"] tr')
      await rows.first().hover()
      await expectCaseShot(page, 'table-row-hover-target', `state-table-row-hover-${theme}.png`)

      await rows.nth(1).hover()
      await expectCaseShot(
        page,
        'table-row-hover-target',
        `state-table-row-selected-hover-${theme}.png`
      )

      await page.locator('[data-gallery-case="card-hover-target"] [data-slot="card"]').hover()
      await expectCaseShot(page, 'card-hover-target', `state-card-hover-${theme}.png`)
    })

    // `disclosure-extra` (PR 09). The tab trigger's box shadow is written by
    // three rules that can all apply at once — the focus ring, the active
    // shadow of a `default` list and the shadow reset of a `line` list — and
    // Tailwind composes them through `--tw-ring-shadow` and `--tw-shadow`
    // rather than by picking a winner, so each combination is captured. The
    // accordion trigger's focus ring also brings a generated `::after` into its
    // flex row, and the scroll area and the drag handle each have exactly one
    // pointer or keyboard state.
    test(`disclosure extra states ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'disclosure-extra', { theme })

      const focusTabTrigger = async (caseName: string, index: number, snapshot: string) => {
        const trigger = page
          .locator(`[data-gallery-case="${caseName}"] [data-slot="tabs-trigger"]`)
          .nth(index)
        await trigger.focus()
        await expectCaseShot(page, caseName, `${snapshot}-${theme}.png`)
        await trigger.blur()
      }

      await focusTabTrigger('tabs-default-focus-target', 0, 'state-tabs-active-focus')
      await focusTabTrigger('tabs-default-focus-target', 1, 'state-tabs-inactive-focus')
      await focusTabTrigger('tabs-line-focus-target', 0, 'state-tabs-line-active-focus')
      await focusTabTrigger('tabs-line-focus-target', 1, 'state-tabs-line-inactive-focus')

      await page
        .locator('[data-gallery-case="tabs-line-hover-target"] [data-slot="tabs-trigger"]')
        .nth(1)
        .hover()
      await expectCaseShot(page, 'tabs-line-hover-target', `state-tabs-line-hover-${theme}.png`)

      // Arrow keys move the active tab, which is the keyboard path Radix owns
      // and the only way the `::after` indicator changes side in a vertical list.
      const firstTab = page
        .locator('[data-gallery-case="tabs-vertical-line"] [data-slot="tabs-trigger"]')
        .first()
      await firstTab.focus()
      await page.keyboard.press('ArrowDown')
      await settle(page)
      await expectCaseShot(page, 'tabs-vertical-line', `state-tabs-vertical-arrow-${theme}.png`)

      const accordionTrigger = page.locator(
        '[data-gallery-case="accordion-focus-target"] [data-slot="accordion-trigger"]'
      )
      await accordionTrigger.focus()
      await expectCaseShot(page, 'accordion-focus-target', `state-accordion-focus-${theme}.png`)
      await accordionTrigger.blur()

      await page
        .locator('[data-gallery-case="accordion-hover-target"] [data-slot="accordion-trigger"]')
        .hover()
      await expectCaseShot(page, 'accordion-hover-target', `state-accordion-hover-${theme}.png`)

      // Chromium makes a scroll container keyboard focusable on its own, which
      // is the only way the viewport's focus ring can ever paint.
      const viewport = page.locator(
        '[data-gallery-case="scroll-area-focus-target"] [data-slot="scroll-area-viewport"]'
      )
      await viewport.focus()
      await expectCaseShot(page, 'scroll-area-focus-target', `state-scroll-area-focus-${theme}.png`)
      await viewport.blur()

      // A wheel scroll moves the thumb, which is the one part of a scroll area
      // whose position no static shot pins.
      const scroller = page.locator(
        '[data-gallery-case="scroll-area-always-vertical"] [data-slot="scroll-area-viewport"]'
      )
      await scroller.hover()
      await page.mouse.wheel(0, 120)
      await settle(page)
      await expectCaseShot(
        page,
        'scroll-area-always-vertical',
        `state-scroll-area-scrolled-${theme}.png`
      )

      const handle = page.locator(
        '[data-gallery-case="resizable-handle-focus-target"] [data-slot="resizable-handle"]'
      )
      await handle.focus()
      await expectCaseShot(
        page,
        'resizable-handle-focus-target',
        `state-resizable-handle-focus-${theme}.png`
      )
      await handle.blur()
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

/**
 * `select-combobox-extra` (PR 15). The select trigger's ring is composed from
 * `focus-visible:ring-3` and `aria-invalid:ring-3`, two rules of equal
 * specificity whose order decides the colour, and its only hover rule is
 * `dark:hover:bg-input/50`. `ComboboxChips` paints the same ring through
 * `focus-within:` and `has-aria-invalid:` instead.
 */
test.describe('selcombo trigger states', () => {
  for (const theme of THEMES) {
    test(`selcombo select and chips states ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'select-combobox-extra', { theme })

      const hoverTarget = page.locator(
        '[data-gallery-case="selcombo-select-hover-target"] [data-slot="select-trigger"]'
      )
      await hoverTarget.hover()
      await expectCaseShot(
        page,
        'selcombo-select-hover-target',
        `state-selcombo-select-hover-${theme}.png`
      )

      const focusTargets = [
        'selcombo-select-focus-target',
        'selcombo-select-invalid-focus-target',
      ] as const

      for (const caseName of focusTargets) {
        const target = page.locator(
          `[data-gallery-case="${caseName}"] [data-slot="select-trigger"]`
        )
        await target.focus()
        await expectCaseShot(
          page,
          caseName,
          `state-${caseName.replace(/-target$/, '')}-${theme}.png`
        )
        await target.blur()
      }

      const chipsInput = page.locator(
        '[data-gallery-case="selcombo-combobox-chips-focus-target"] [data-slot="combobox-chip-input"]'
      )
      await chipsInput.focus()
      await expectCaseShot(
        page,
        'selcombo-combobox-chips-focus-target',
        `state-selcombo-combobox-chips-focus-${theme}.png`
      )
      await chipsInput.blur()

      const invalidChips = page.locator(
        '[data-gallery-case="selcombo-combobox-chips-invalid"] [data-slot="combobox-chip-input"]'
      )
      await invalidChips.focus()
      await expectCaseShot(
        page,
        'selcombo-combobox-chips-invalid',
        `state-selcombo-combobox-chips-invalid-focus-${theme}.png`
      )
      await invalidChips.blur()
    })
  }
})

/**
 * `command-calendar-extra` (PR 16).
 *
 * The states of `command.tsx` and `calendar.tsx` that only a pointer or the
 * keyboard reaches. Three of them exist because a property is written twice on
 * one element and the winner is decided by cascade order rather than by
 * intent:
 *
 * - a hovered **selected** day. `Button`'s `ghost` variant paints
 *   `hover:bg-muted` / `hover:text-foreground` while `CalendarDayButton` paints
 *   `data-[selected-single=true]:bg-primary`, and in dark mode a third rule
 *   (`dark:hover:text-foreground`) outranks the second. All three combinations
 *   are captured, in both themes, because nothing else in the suite pins them;
 * - a hovered **range middle** day, where the cell's own `bg-muted` and the
 *   button's `data-[range-middle=true]:bg-muted` agree and the ghost hover
 *   must not change that;
 * - a **keyboard-focused** day. `react-day-picker` puts `data-focused="true"`
 *   on the *cell*, and the button's ring is written through
 *   `group-data-[focused=true]/day:` rather than through its own
 *   `:focus-visible`.
 *
 * The month navigation cases exercise the two buttons `buttonVariants` still
 * styles, by pointer and by keyboard, and the command case is cmdk's own
 * keyboard selection moving `data-selected` between items.
 */
test.describe('command and calendar interactions', () => {
  for (const theme of THEMES) {
    test(`cmdcal command keyboard selection ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'command-calendar-extra', { theme })

      const input = page.locator('[data-gallery-case="cmdcal-command-full"] input')
      await input.focus()
      await settle(page)
      await expectCaseShot(page, 'cmdcal-command-full', `state-cmdcal-command-focus-${theme}.png`)

      await page.keyboard.press('ArrowDown')
      await settle(page)
      await expectCaseShot(
        page,
        'cmdcal-command-full',
        `state-cmdcal-command-arrow-down-${theme}.png`
      )

      await input.fill('summ')
      await settle(page)
      await expectCaseShot(
        page,
        'cmdcal-command-full',
        `state-cmdcal-command-filtered-${theme}.png`
      )

      await input.fill('zzzz')
      await settle(page)
      await expectCaseShot(
        page,
        'cmdcal-command-full',
        `state-cmdcal-command-no-results-${theme}.png`
      )

      await page
        .locator('[data-gallery-case="cmdcal-command-checked"] [data-slot="command-item"]')
        .nth(1)
        .hover()
      await settle(page)
      await expectCaseShot(
        page,
        'cmdcal-command-checked',
        `state-cmdcal-command-item-hover-${theme}.png`
      )
    })

    test(`cmdcal calendar day states ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'command-calendar-extra', { theme })

      const plainDay = page
        .locator('[data-gallery-case="cmdcal-calendar-nav-target"] button[data-day]')
        .nth(10)
      await plainDay.hover()
      await expectCaseShot(
        page,
        'cmdcal-calendar-nav-target',
        `state-cmdcal-calendar-day-hover-${theme}.png`
      )

      const selectedDay = page.locator(
        '[data-gallery-case="cmdcal-calendar-in-card"] button[data-selected-single="true"]'
      )
      await selectedDay.hover()
      await expectCaseShot(
        page,
        'cmdcal-calendar-in-card',
        `state-cmdcal-calendar-selected-hover-${theme}.png`
      )

      const middleDay = page
        .locator(
          '[data-gallery-case="cmdcal-calendar-range-weeks"] button[data-range-middle="true"]'
        )
        .nth(2)
      await middleDay.hover()
      await expectCaseShot(
        page,
        'cmdcal-calendar-range-weeks',
        `state-cmdcal-calendar-range-middle-hover-${theme}.png`
      )

      const startDay = page.locator(
        '[data-gallery-case="cmdcal-calendar-range-weeks"] button[data-range-start="true"]'
      )
      await startDay.hover()
      await expectCaseShot(
        page,
        'cmdcal-calendar-range-weeks',
        `state-cmdcal-calendar-range-start-hover-${theme}.png`
      )

      // `data-focused="true"` lands on the *cell*, and only after a keyboard
      // move: the effect in `CalendarDayButton` then pulls focus to the button.
      const firstDay = page
        .locator('[data-gallery-case="cmdcal-calendar-nav-target"] button[data-day]')
        .first()
      await firstDay.focus()
      await page.keyboard.press('ArrowRight')
      await settle(page)
      await expectCaseShot(
        page,
        'cmdcal-calendar-nav-target',
        `state-cmdcal-calendar-day-keyboard-focus-${theme}.png`
      )
    })

    test(`cmdcal calendar month navigation ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'command-calendar-extra', { theme })

      const target = '[data-gallery-case="cmdcal-calendar-nav-target"]'
      const previous = page.locator(`${target} [data-slot="calendar"] .rdp-button_previous`)
      const next = page.locator(`${target} [data-slot="calendar"] .rdp-button_next`)

      await previous.hover()
      await expectCaseShot(
        page,
        'cmdcal-calendar-nav-target',
        `state-cmdcal-calendar-nav-hover-${theme}.png`
      )

      await next.focus()
      await expectCaseShot(
        page,
        'cmdcal-calendar-nav-target',
        `state-cmdcal-calendar-nav-focus-${theme}.png`
      )

      await next.click()
      await settle(page)
      await expectCaseShot(
        page,
        'cmdcal-calendar-nav-target',
        `state-cmdcal-calendar-next-month-${theme}.png`
      )

      await previous.focus()
      await page.keyboard.press('Enter')
      await page.keyboard.press('Enter')
      await settle(page)
      await expectCaseShot(
        page,
        'cmdcal-calendar-nav-target',
        `state-cmdcal-calendar-keyboard-month-${theme}.png`
      )
    })
  }
})

/**
 * Avatar, breadcrumb and pagination interaction states (PR 18), appended as a
 * new block so no existing test name or original moves.
 *
 * A breadcrumb link's `hover:text-foreground` and a pagination link's
 * `focus-visible:` ring are the two states no static case can reach. The ring
 * needs a *keyboard* focus: Chromium only matches `:focus-visible` on an anchor
 * when the focus came from the keyboard, so each focus case steps back with
 * `Shift+Tab` and returns with `Tab` rather than calling `focus()`.
 */
test.describe('navbits interaction states', () => {
  for (const theme of THEMES) {
    test(`navbits breadcrumb and pagination states ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'nav-bits-extra', { theme })

      await page
        .locator(
          '[data-gallery-case="navbits-breadcrumb-hover-target"] [data-slot="breadcrumb-link"]'
        )
        .hover()
      await expectCaseShot(
        page,
        'navbits-breadcrumb-hover-target',
        `state-navbits-breadcrumb-hover-${theme}.png`
      )

      const breadcrumbLink = page.locator(
        '[data-gallery-case="navbits-breadcrumb-focus-target"] [data-slot="breadcrumb-link"]'
      )
      await breadcrumbLink.focus()
      await page.keyboard.press('Shift+Tab')
      await page.keyboard.press('Tab')
      await expectCaseShot(
        page,
        'navbits-breadcrumb-focus-target',
        `state-navbits-breadcrumb-focus-${theme}.png`
      )
      await breadcrumbLink.blur()

      await page
        .locator(
          '[data-gallery-case="navbits-pagination-hover-target"] [data-slot="pagination-link"]'
        )
        .hover()
      await expectCaseShot(
        page,
        'navbits-pagination-hover-target',
        `state-navbits-pagination-hover-${theme}.png`
      )

      const paginationLink = page.locator(
        '[data-gallery-case="navbits-pagination-focus-target"] [data-slot="pagination-link"]'
      )
      await paginationLink.focus()
      await page.keyboard.press('Shift+Tab')
      await page.keyboard.press('Tab')
      await expectCaseShot(
        page,
        'navbits-pagination-focus-target',
        `state-navbits-pagination-focus-${theme}.png`
      )
      await paginationLink.blur()

      // The previous/next links are the only pagination parts whose label is
      // hidden below `sm`, so their hover is captured at both viewports too.
      await page
        .locator('[data-gallery-case="navbits-pagination-full"] [aria-label="Go to next page"]')
        .hover()
      await expectCaseShot(
        page,
        'navbits-pagination-full',
        `state-navbits-pagination-next-hover-${theme}.png`
      )
    })
  }
})

/**
 * Tool card and skill-library filter interaction states (PR 22), appended as a
 * new block so no existing test name or original moves.
 *
 * Four states no static case can reach: the compact card's hover lift, the
 * overflow-menu button's hover, a focused search field, and an expanded
 * accordion body inside `ToolCard`. The last group drives the one filter bar
 * that owns its state, so selecting a tool, selecting a tag and moving the
 * display-view switch are captured the way a user produces them.
 */
test.describe('toolsx interaction states', () => {
  for (const theme of THEMES) {
    test(`toolsx card and filter states ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'tools-filters-extra', { theme })

      await page.locator('[data-gallery-case="toolsx-compact-hover-target"] [role="link"]').hover()
      await expectCaseShot(
        page,
        'toolsx-compact-hover-target',
        `state-toolsx-card-hover-${theme}.png`
      )

      await page
        .locator(
          '[data-gallery-case="toolsx-compact-menu-target"] [data-slot="dropdown-menu-trigger"]'
        )
        .hover()
      await expectCaseShot(
        page,
        'toolsx-compact-menu-target',
        `state-toolsx-card-menu-hover-${theme}.png`
      )

      const search = page.locator('[data-gallery-case="toolsx-filter-bar-focus-target"] input')
      await search.focus()
      await expectCaseShot(
        page,
        'toolsx-filter-bar-focus-target',
        `state-toolsx-filter-focus-${theme}.png`
      )
      await search.blur()

      await page
        .locator(
          '[data-gallery-case="toolsx-tool-card-accordion-target"] [data-slot="accordion-trigger"]'
        )
        .first()
        .click()
      await settle(page)
      await expectCaseShot(
        page,
        'toolsx-tool-card-accordion-target',
        `state-toolsx-accordion-open-${theme}.png`
      )
    })

    test(`toolsx filter selection and view switch ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'tools-filters-extra', { theme })

      const bar = page.locator('[data-gallery-case="toolsx-filter-bar-stateful"]')

      await bar.getByRole('button', { name: 'Cursor' }).click()
      await settle(page)
      await expectCaseShot(
        page,
        'toolsx-filter-bar-stateful',
        `state-toolsx-tool-selected-${theme}.png`
      )

      await bar.getByRole('button', { name: '#git' }).click()
      await settle(page)
      await expectCaseShot(
        page,
        'toolsx-filter-bar-stateful',
        `state-toolsx-tag-selected-${theme}.png`
      )

      await bar.getByRole('button', { name: 'Grid view' }).click()
      await settle(page)
      await expectCaseShot(
        page,
        'toolsx-filter-bar-stateful',
        `state-toolsx-view-grid-${theme}.png`
      )

      await bar.getByRole('button', { name: 'List view' }).click()
      await settle(page)
      await expectCaseShot(
        page,
        'toolsx-filter-bar-stateful',
        `state-toolsx-view-list-${theme}.png`
      )
    })
  }
})

/**
 * `skills-extra` (PR 23), appended as a new block so no existing test name or
 * original moves.
 *
 * The pointer and keyboard states no static case reaches: the two card hover
 * rules (a ring composed through `Card`'s own `ring-1` in grid mode, a
 * background in list mode), the tags box's `focus-within` ring, the remove
 * button's hover colour, a removed tag, a suggestion hovered with the pointer
 * while the caret stays in the input, a tag added with Enter, and a resource
 * row hovered and then selected.
 *
 * Order matters: every state that changes a case's height comes last, and the
 * one full-page shot is taken before any of them. The suggestion list is
 * absolutely positioned and falls outside its case's box, which is why that one
 * is a page capture.
 */
test.describe('skillsx interaction states', () => {
  for (const theme of THEMES) {
    test(`skillsx card tag and file states ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'skills-extra', { theme })

      await page
        .locator('[data-gallery-case="skillsx-card-grid-hover-target"] [data-slot="card"]')
        .hover()
      await expectCaseShot(
        page,
        'skillsx-card-grid-hover-target',
        `state-skillsx-card-grid-hover-${theme}.png`
      )

      await page.locator('[data-gallery-case="skillsx-card-list-hover-target"] > div').hover()
      await expectCaseShot(
        page,
        'skillsx-card-list-hover-target',
        `state-skillsx-card-list-hover-${theme}.png`
      )

      const focusInput = page.locator('[data-gallery-case="skillsx-tags-focus-target"] input')
      await focusInput.focus()
      await expectCaseShot(
        page,
        'skillsx-tags-focus-target',
        `state-skillsx-tags-focus-${theme}.png`
      )
      await focusInput.blur()

      await page
        .locator('[data-gallery-case="skillsx-tags-remove-target"] [aria-label="Remove tag git"]')
        .hover()
      await expectCaseShot(
        page,
        'skillsx-tags-remove-target',
        `state-skillsx-tag-remove-hover-${theme}.png`
      )

      const fileRow = page.locator('[data-gallery-case="skillsx-files-long-names"] button').first()
      await fileRow.hover()
      await expectCaseShot(
        page,
        'skillsx-files-long-names',
        `state-skillsx-file-hover-${theme}.png`
      )

      // The suggestion list only exists while the input has a matching value,
      // and hovering a suggestion leaves the caret in the input, so Enter below
      // still adds what was typed rather than what is hovered.
      const keyboardInput = page.locator('[data-gallery-case="skillsx-tags-keyboard-target"] input')
      await keyboardInput.focus()
      await keyboardInput.fill('refactor')
      await page
        .locator('[data-gallery-case="skillsx-tags-keyboard-target"] ul')
        .waitFor({ state: 'visible' })
      await page
        .locator('[data-gallery-case="skillsx-tags-keyboard-target"] ul button')
        .first()
        .hover()
      await expectShot(page, `state-skillsx-tag-suggestion-hover-${theme}.png`, { fullPage: true })

      await keyboardInput.press('Enter')
      await settle(page)
      await expectCaseShot(
        page,
        'skillsx-tags-keyboard-target',
        `state-skillsx-tag-added-${theme}.png`
      )

      await page
        .locator('[data-gallery-case="skillsx-tags-remove-target"] [aria-label="Remove tag git"]')
        .click()
      await settle(page)
      await expectCaseShot(
        page,
        'skillsx-tags-remove-target',
        `state-skillsx-tag-removed-${theme}.png`
      )

      const selectRow = page
        .locator('[data-gallery-case="skillsx-files-select-target"] button')
        .first()
      await selectRow.click()
      await page
        .locator('[data-gallery-case="skillsx-files-select-target"] textarea')
        .waitFor({ state: 'visible' })
      await settle(page)
      await expectCaseShot(
        page,
        'skillsx-files-select-target',
        `state-skillsx-file-selected-${theme}.png`
      )
    })
  }
})

/**
 * Projects table, filter bar and skills-section interaction states (PR 24),
 * appended as a new block so no existing test name or original moves.
 *
 * The states a static case cannot reach: a hovered table row, a hovered and a
 * keyboard-focused favourite star, a sort applied by clicking a header, a
 * focused search field, each filter button selected in turn, and the skills
 * section switched to its grid view (its view mode is component state, not a
 * prop).
 */
test.describe('projectsx interaction states', () => {
  for (const theme of THEMES) {
    test(`projectsx table row and action states ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'projects-extra', { theme })

      const table = '[data-gallery-case="projectsx-table-stateful"]'

      await page.locator(`${table} tbody tr`).nth(1).hover()
      await expectCaseShot(
        page,
        'projectsx-table-stateful',
        `state-projectsx-row-hover-${theme}.png`
      )

      const star = page.locator(`${table} tbody tr`).first().locator('button').first()
      await star.hover()
      await expectCaseShot(
        page,
        'projectsx-table-stateful',
        `state-projectsx-star-hover-${theme}.png`
      )

      const unstarred = page.locator(`${table} tbody tr`).nth(1).locator('button').first()
      await unstarred.hover()
      await expectCaseShot(
        page,
        'projectsx-table-stateful',
        `state-projectsx-star-empty-hover-${theme}.png`
      )

      await unstarred.click()
      await settle(page)
      await expectCaseShot(
        page,
        'projectsx-table-stateful',
        `state-projectsx-star-toggled-${theme}.png`
      )

      const del = page.locator(`${table} tbody tr`).first().locator('button').last()
      await del.hover()
      await expectCaseShot(
        page,
        'projectsx-table-stateful',
        `state-projectsx-delete-hover-${theme}.png`
      )

      await del.focus()
      await expectCaseShot(
        page,
        'projectsx-table-stateful',
        `state-projectsx-delete-focus-${theme}.png`
      )
      await del.blur()
    })

    test(`projectsx table sorting ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'projects-extra', { theme })

      const table = '[data-gallery-case="projectsx-table-stateful"]'
      const nameHeader = page.locator(`${table} thead button`).first()

      await nameHeader.hover()
      await expectCaseShot(
        page,
        'projectsx-table-stateful',
        `state-projectsx-sort-header-hover-${theme}.png`
      )

      await nameHeader.click()
      await settle(page)
      await expectCaseShot(
        page,
        'projectsx-table-stateful',
        `state-projectsx-sorted-name-asc-${theme}.png`
      )

      await nameHeader.click()
      await settle(page)
      await expectCaseShot(
        page,
        'projectsx-table-stateful',
        `state-projectsx-sorted-name-desc-${theme}.png`
      )

      const pathHeader = page.locator(`${table} thead button`).nth(1)
      await pathHeader.click()
      await settle(page)
      await expectCaseShot(
        page,
        'projectsx-table-stateful',
        `state-projectsx-sorted-path-asc-${theme}.png`
      )
    })

    test(`projectsx filter bar states ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'projects-extra', { theme })

      const bar = '[data-gallery-case="projectsx-filter-bar-stateful"]'
      const input = page.locator(`${bar} [data-slot="input-group-control"]`)

      await input.focus()
      await expectCaseShot(
        page,
        'projectsx-filter-bar-stateful',
        `state-projectsx-search-focus-${theme}.png`
      )

      await input.fill('alpha')
      await settle(page)
      await expectCaseShot(
        page,
        'projectsx-filter-bar-stateful',
        `state-projectsx-search-filled-${theme}.png`
      )

      await page.locator(`${bar} [data-slot="input-group-addon"] button`).click()
      await settle(page)
      await expectCaseShot(
        page,
        'projectsx-filter-bar-stateful',
        `state-projectsx-search-cleared-${theme}.png`
      )

      const tools = page.locator(`${bar} [data-slot="button"]`)
      const toolCount = await tools.count()
      for (let index = 0; index < toolCount; index += 1) {
        await tools.nth(index).click()
        await settle(page)
        await expectCaseShot(
          page,
          'projectsx-filter-bar-stateful',
          `state-projectsx-tool-${index}-selected-${theme}.png`
        )
      }

      await tools.first().hover()
      await expectCaseShot(
        page,
        'projectsx-filter-bar-stateful',
        `state-projectsx-tool-hover-${theme}.png`
      )
    })

    test(`projectsx skills section view modes ${theme}`, async ({ page }) => {
      await gotoGallery(page, 'projects-extra', { theme })

      const section = '[data-gallery-case="projectsx-skills-section-view-target"]'
      // `DisplayViewSwitch` renders a bare `div[role="group"]` with two plain
      // buttons; it has no `data-slot` of its own.
      const switches = page.locator(`${section} [role="group"] button`)

      await switches.last().click()
      await settle(page)
      await expectCaseShot(
        page,
        'projectsx-skills-section-view-target',
        `state-projectsx-skills-grid-${theme}.png`
      )

      await switches.first().click()
      await settle(page)
      await expectCaseShot(
        page,
        'projectsx-skills-section-view-target',
        `state-projectsx-skills-list-${theme}.png`
      )

      const saveAll = page.locator(`${section} [data-slot="button"]`).first()
      await saveAll.hover()
      await expectCaseShot(
        page,
        'projectsx-skills-section-view-target',
        `state-projectsx-save-all-hover-${theme}.png`
      )
    })
  }
})
