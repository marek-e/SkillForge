import { test } from '@playwright/test'
import { emulateNoHover, expectCaseShot, gotoGallery, THEMES } from './helpers'

/**
 * The hover rules of PR 04's components, captured on a pointer that cannot
 * hover.
 *
 * Tailwind v4 emits a hover variant as `&:hover { @media (hover: hover) { … } }`,
 * so none of these rules fire under `@media (hover: none)`. PR 04 translated
 * them to a bare `':hover'` key, which fires on every pointer; nothing in the
 * suite could see the difference, because Chromium reports `hover: hover` in
 * both viewport projects.
 *
 * These originals were captured from the frozen tree, so they show Tailwind's
 * behaviour: a hovered element with no hover styling on it. A bare `':hover'`
 * rule fails them.
 */
const NO_HOVER_CASES = [
  {
    section: 'buttons',
    id: 'button-and-toggle',
    // `Button` (`hover:bg-primary/80`) and `Toggle` (`hover:bg-muted`,
    // `hover:text-foreground`).
    targets: [
      ['button-hover-target', 'button'],
      ['toggle-off', 'button'],
    ],
  },
  {
    section: 'buttons-extra',
    id: 'badge-and-view-switch',
    // `Badge` as an anchor, where the rule is the arbitrary-variant form
    // (`[a]:hover:bg-primary/80`) and then the plain one on the ghost variant,
    // plus `DisplayViewSwitch`'s inactive button.
    targets: [
      ['badge-hover-target', 'a'],
      ['badge-hover-ghost-target', 'a'],
      ['display-view-switch-hover-target', 'button'],
    ],
  },
] as const

for (const group of NO_HOVER_CASES) {
  for (const theme of THEMES) {
    test(`no-hover pointer ${group.id} ${theme}`, async ({ page }) => {
      await gotoGallery(page, group.section, { theme })
      await emulateNoHover(page)

      for (const [caseName, selector] of group.targets) {
        const target = page.locator(`[data-gallery-case="${caseName}"] ${selector}`).last()
        await target.hover()
        await expectCaseShot(page, caseName, `no-hover-${caseName}-${theme}.png`)
      }
    })
  }
}
