import { test } from '@playwright/test'
import type { DataMode } from './api-mock'
import { expectRouteShots, expectShot, gotoRoute, settle, THEMES } from './helpers'

interface RouteCase {
  id: string
  path: string
  /** Data modes worth freezing for this route. */
  modes: DataMode[]
}

const ROUTES: RouteCase[] = [
  { id: 'home', path: '/', modes: ['populated', 'empty', 'loading', 'error'] },
  { id: 'tools', path: '/tools', modes: ['populated', 'empty', 'loading', 'error'] },
  {
    id: 'tool-detail',
    path: '/tools/claude-code',
    modes: ['populated', 'empty', 'loading', 'error'],
  },
  {
    id: 'skill-library',
    path: '/skill-library',
    modes: ['populated', 'empty', 'loading', 'error'],
  },
  {
    id: 'skill-detail',
    path: '/skill-library/skill-alpha',
    modes: ['populated', 'empty', 'loading', 'error'],
  },
  { id: 'projects', path: '/projects', modes: ['populated', 'empty', 'loading', 'error'] },
  {
    id: 'project-detail',
    path: '/projects/project-alpha',
    modes: ['populated', 'empty', 'loading', 'error'],
  },
  // The settings page reads only localStorage, so it has no loading or error state.
  { id: 'settings', path: '/settings', modes: ['populated', 'empty'] },
]

for (const route of ROUTES) {
  for (const mode of route.modes) {
    for (const theme of THEMES) {
      test(`route ${route.id} ${mode} ${theme}`, async ({ page }) => {
        await gotoRoute(page, route.path, { theme, data: mode })
        await expectRouteShots(page, `${route.id}-${mode}-${theme}`)
      })
    }
  }
}

test.describe('shell states', () => {
  for (const theme of THEMES) {
    // Desktop collapses the rail in place; below the `md` breakpoint the same
    // trigger opens the sidebar as a sheet instead.
    test(`sidebar toggled ${theme}`, async ({ page }, testInfo) => {
      await gotoRoute(page, '/projects', { theme })
      await page.locator('[data-slot="sidebar-trigger"]').first().click()
      if (testInfo.project.name === 'mobile') {
        await page
          .locator('[data-slot="sidebar"][data-mobile="true"]')
          .waitFor({ state: 'visible' })
      } else {
        await page.waitForFunction(
          () =>
            document.querySelector('[data-slot="sidebar"]')?.getAttribute('data-state') ===
            'collapsed'
        )
      }
      await settle(page)
      await expectShot(page, `shell-sidebar-toggled-${theme}.png`, { fullPage: true })
    })

    test(`not found route ${theme}`, async ({ page }) => {
      await gotoRoute(page, '/this-route-does-not-exist', { theme, waitFor: '[data-slot="empty"]' })
      await expectShot(page, `shell-not-found-${theme}.png`, { fullPage: true })
    })

    test(`skill library grid mode ${theme}`, async ({ page }) => {
      await gotoRoute(page, '/skill-library', {
        theme,
        storage: { 'skillforge:defaultSkillView': 'grid' },
      })
      await expectRouteShots(page, `skill-library-grid-${theme}`)
    })

    test(`settings custom editor ${theme}`, async ({ page }) => {
      await gotoRoute(page, '/settings', {
        theme,
        storage: {
          'skillforge:defaultEditor': 'custom',
          'skillforge:customEditorCmd': 'windsurf',
          'skillforge:defaultSkillView': 'grid',
        },
      })
      await expectRouteShots(page, `settings-custom-editor-${theme}`)
    })

    test(`project detail reduced motion ${theme}`, async ({ page }) => {
      await gotoRoute(page, '/projects/project-alpha', { theme, reducedMotion: 'reduce' })
      await expectRouteShots(page, `project-detail-reduced-motion-${theme}`)
    })
  }
})
