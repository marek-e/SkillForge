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

/**
 * The skill-library grid between its two breakpoints (PR 27).
 *
 * The route's grid container is the one route-local element with a state
 * neither project reaches: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` is one
 * column at 390px and three at 1440px, so the two-column band between 40rem and
 * 64rem is never captured — and it is exactly where a wrong order between the
 * two migrated media queries would hide. A gallery case cannot reach it either,
 * because these are viewport media queries and a gallery section is sized by the
 * same viewport, so the case lives here with its own width. `routeslib` selects
 * exactly these tests.
 */
test.describe('routeslib grid breakpoint', () => {
  for (const theme of THEMES) {
    test(`routeslib skill library grid two column ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: 800, height: 900 })
      await gotoRoute(page, '/skill-library', {
        theme,
        storage: { 'skillforge:defaultSkillView': 'grid' },
      })
      await expectRouteShots(page, `routeslib-skill-library-grid-2col-${theme}`)
    })
  }
})

/**
 * The one state of `/projects` no data fixture reaches (PR 29).
 *
 * `route projects {populated,empty,loading,error}` covers every branch the API
 * decides. The filtered branch is decided by the route instead: typing a query
 * that matches nothing swaps the table for a paragraph the route renders
 * itself, and turns the count above it into its `N of M` form. Both are
 * route-local elements, so only a typed query captures them.
 */
test.describe('routesprojects filtered', () => {
  for (const theme of THEMES) {
    test(`routesprojects no match ${theme}`, async ({ page }) => {
      await gotoRoute(page, '/projects', { theme })
      await page.getByPlaceholder('Search projects...').fill('no-such-project')
      await page.getByText('No projects match your filters.').waitFor({ state: 'visible' })
      await settle(page)
      await expectRouteShots(page, `routesprojects-no-match-${theme}`)
    })
  }
})
