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

/**
 * States a route only reaches through the pointer or the keyboard (PR 05).
 *
 * The back button and the name input of the skill detail route are the two
 * controls a caller `className` styles on top of the component's own rules, so
 * they are the two places where a cascade change would show up on a real page
 * rather than in the gallery.
 */
test.describe('route interactions', () => {
  for (const theme of THEMES) {
    test(`skill detail back button hover ${theme}`, async ({ page }) => {
      await gotoRoute(page, '/skill-library/skill-alpha', { theme })
      const back = page
        .locator('main')
        .last()
        .locator('[data-slot="button"][data-variant="ghost"]')
        .first()
      await back.hover()
      await expectShot(back, `state-skill-detail-back-hover-${theme}.png`)
    })

    test(`skill detail name input focus ${theme}`, async ({ page }) => {
      await gotoRoute(page, '/skill-library/skill-alpha', { theme })
      const nameInput = page.locator('main').last().locator('[data-slot="input"]').first()
      await nameInput.focus()
      await expectShot(nameInput, `state-skill-detail-name-focus-${theme}.png`)
    })
  }
})
