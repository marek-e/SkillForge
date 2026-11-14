import { expect, test } from '@playwright/test'
import { gotoRoute, THEMES } from './helpers'

for (const theme of THEMES) {
  test(`appsidebar editor preference persists ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/settings', { theme })
    const editor = page.locator('main [data-slot="select-trigger"]').first()
    await editor.click()
    await page.getByRole('option', { name: 'Custom…', exact: true }).click()
    const command = page.getByPlaceholder('e.g. windsurf')
    await command.fill('  windsurf --new-window  ')
    await command.press('Tab')
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('skillforge:customEditorCmd')))
      .toBe('windsurf --new-window')
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('skillforge:defaultEditor')))
      .toBe('custom')
    await editor.click()
    await page.getByRole('option', { name: 'VS Code', exact: true }).click()
    await expect(command).toHaveCount(0)
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('skillforge:defaultEditor')))
      .toBe('code')
  })

  test(`appsidebar navigation active state ${theme}`, async ({ page }, testInfo) => {
    await gotoRoute(page, '/projects', { theme })
    if (testInfo.project.name === 'mobile') {
      await page.locator('[data-slot="sidebar-trigger"]').first().click()
    }
    const sidebar = page.locator('[data-slot="sidebar"]').filter({ visible: true }).last()
    const library = sidebar.getByRole('link', { name: 'Skill Library', exact: true })
    await library.click()
    await expect(page).toHaveURL(/\/skill-library$/)
    await expect(library).toHaveAttribute('data-active', 'true')
    const favorite = sidebar.getByRole('link', { name: /Alpha Platform/ })
    await favorite.click()
    await expect(page).toHaveURL(/\/projects\/project-alpha$/)
    await expect(favorite).toHaveAttribute('data-active', 'true')
  })
}
