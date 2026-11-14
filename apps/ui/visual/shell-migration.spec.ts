import { test } from '@playwright/test'
import {
  emulateNoHover,
  expectShot,
  expectTextSnapshot,
  gotoRoute,
  THEMES,
  waitForAnimationsToFinish,
} from './helpers'

for (const theme of THEMES) {
  test(`shellx theme toggle ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/projects/project-alpha', { theme })
    const header = page.locator('header').first()
    await expectShot(header, `shellx-header-${theme}.png`)
    const toggle = header.getByRole('button', { name: 'Toggle theme' })
    await expectTextSnapshot(
      JSON.stringify(
        await toggle.locator('svg').evaluateAll((icons) =>
          icons.map((icon) => {
            const style = getComputedStyle(icon)
            return Object.fromEntries(
              [
                'width',
                'height',
                'position',
                'scale',
                'rotate',
                'transition-property',
                'transition-duration',
                'transition-timing-function',
              ].map((property) => [property, style.getPropertyValue(property)])
            )
          })
        ),
        null,
        2
      ) + '\n',
      `shellx-toggle-${theme}.json`
    )
    await toggle.click()
    await waitForAnimationsToFinish(page)
    await expectShot(page.getByRole('menu'), `shellx-theme-menu-${theme}.png`)
  })

  test(`shellx titlebar controls ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/projects', { theme, electron: 'win32' })
    const titlebar = page.locator('.electron-app > .drag').first()
    const close = titlebar.getByRole('button', { name: 'Close', exact: true })
    await close.hover()
    await expectShot(titlebar, `shellx-titlebar-hover-${theme}.png`)
    await emulateNoHover(page)
    await close.hover()
    await expectShot(titlebar, `shellx-titlebar-no-hover-${theme}.png`)
    await expectTextSnapshot(
      JSON.stringify(
        await titlebar.evaluate((element) => {
          const style = getComputedStyle(element)
          return {
            drag: style.getPropertyValue('-webkit-app-region'),
            buttons: [...element.querySelectorAll('button')].map((button) => ({
              label: button.getAttribute('aria-label'),
              drag: getComputedStyle(button.parentElement!).getPropertyValue('-webkit-app-region'),
              disabled: button.disabled,
              width: getComputedStyle(button).width,
              height: getComputedStyle(button).height,
            })),
          }
        }),
        null,
        2
      ) + '\n',
      `shellx-titlebar-${theme}.json`
    )
  })
}
