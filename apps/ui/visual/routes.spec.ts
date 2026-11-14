import { test } from '@playwright/test'
import type { DataMode } from './api-mock'
import {
  emulateNoHover,
  expectRouteShots,
  expectShot,
  gotoRoute,
  preparePage,
  settle,
  THEMES,
  waitForAnimationsToFinish,
} from './helpers'

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

/**
 * Skill-detail states the fixture matrix cannot reach (PR 28).
 *
 * `route skill-detail {populated,empty,loading,error}` already covers every
 * branch of this route's own JSX — the tool badge, the skill-directory block,
 * the instructions block, the "no file" paragraph and the three skeletons — so
 * these three cases only add what the matrix structurally cannot show:
 *
 * - **editing**: the form after a change, which is the only state where the
 *   footer's save button is enabled, and with a resource file expanded, which
 *   is the only state where the page's `space-y-6` stack has to hold a second
 *   editor between the sections it renders itself.
 * - **long content**: `skill-delta` has a name that overflows the header input,
 *   a body far taller than the instructions textarea and a resource file with a
 *   long name, so the stack scrolls instead of fitting one screen.
 * - **narrow badges**: the badge row is `flex-wrap`, and it does not wrap at
 *   either project width — the three items measure ~280px against 358px of
 *   content box at 390px. 320px is the narrowest width the app ships for and
 *   the only one that puts the row on two lines.
 *
 * `routesskill` selects exactly these tests.
 */
test.describe('routesskill skill detail states', () => {
  for (const theme of THEMES) {
    test(`routesskill skill detail editing ${theme}`, async ({ page }) => {
      await gotoRoute(page, '/skill-library/skill-alpha', { theme })
      const main = page.locator('main').last()
      await main.locator('[data-slot="input"]').first().fill('summarize-pull-request-v2')
      await main.locator('button', { hasText: 'reference.md' }).click()
      // The resource editor fetches its content, so the textarea exists before
      // it has anything in it.
      await page.waitForFunction(() => {
        const areas = document.querySelectorAll('main textarea')
        const last = areas[areas.length - 1] as HTMLTextAreaElement | undefined
        return !!last && last.value.length > 0
      })
      await main.locator('[data-slot="input"]').nth(1).fill('An edited description.')
      await settle(page)
      await expectRouteShots(page, `routesskill-skill-detail-editing-${theme}`)
    })

    test(`routesskill skill detail long content ${theme}`, async ({ page }) => {
      await gotoRoute(page, '/skill-library/skill-delta', { theme })
      await expectRouteShots(page, `routesskill-skill-detail-long-${theme}`)
    })

    test(`routesskill skill detail narrow badges ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 900 })
      await gotoRoute(page, '/skill-library/skill-alpha', { theme })
      await expectRouteShots(page, `routesskill-skill-detail-narrow-${theme}`)
    })
  }
})

/**
 * The two states of `/projects/$projectId` the route fixtures cannot reach (PR 30).
 *
 * `routes.spec.ts` already freezes the route in populated / empty / loading /
 * error, and PR 24 froze the overview card's long path and all three project
 * dialogs as `projectsx` gallery and overlay cases, so the only styling this
 * route owns that nothing captures is:
 *
 * 1. the **skills** skeleton stack. It renders when the project has resolved
 *    but `useProjectSkills` has not, and `loading` mode hangs every endpoint,
 *    so the earlier `isPending` branch wins there and this one never shows. A
 *    second `page.route` registered after the fixture mock — Playwright runs the
 *    most recently added matching handler first — hangs only the skills request.
 *    It also freezes the refresh button disabled with its spinning icon.
 * 2. the four header action buttons on hover. Three of them keep their palette
 *    colours as Tailwind classes and the fourth passes the same `sx` the table's
 *    delete action uses, so this is where a wrong `@media (hover: hover)`
 *    wrapper, a dropped `ghost` arm, or a `group/button` class that stopped
 *    reaching the star would show on a real page.
 *
 * `routesproject` selects exactly these tests.
 */
const PROJECT_SKILLS_ENDPOINT =
  /^https?:\/\/(localhost|127\.0\.0\.1):4321\/api\/projects\/[^/]+\/skills(\?|$)/

const HEADER_ACTIONS = ['favorite', 'rename', 'delete', 'refresh']

test.describe('routesproject route states', () => {
  for (const theme of THEMES) {
    test(`routesproject skills pending ${theme}`, async ({ page }) => {
      await preparePage(page, { theme })
      await page.route(PROJECT_SKILLS_ENDPOINT, () => {
        // Deliberately never settled, exactly as `loading` mode does.
      })
      await page.goto('/projects/project-alpha', { waitUntil: 'commit' })
      const main = page.locator('main').last()
      // The heading proves the project query resolved; the skeleton proves the
      // skills query has not. `networkidle` is unusable while a request hangs.
      await main.locator('h1').waitFor({ state: 'visible' })
      await main.locator('[data-slot="skeleton"]').first().waitFor({ state: 'visible' })
      await page.evaluate(() => document.fonts.ready)
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
      )
      await expectRouteShots(page, `routesproject-skills-pending-${theme}`)
    })

    test(`routesproject header action hover ${theme}`, async ({ page }) => {
      await gotoRoute(page, '/projects/project-alpha', { theme })
      const buttons = page
        .locator('main')
        .last()
        .locator('h1')
        .locator('xpath=..')
        .locator('[data-size="icon-xs"]')
      for (const [index, action] of HEADER_ACTIONS.entries()) {
        const button = buttons.nth(index)
        await button.hover()
        await expectShot(button, `routesproject-action-${action}-hover-${theme}.png`)
      }
    })
  }
})

/**
 * The states of `/` no data fixture and no gallery case can reach (PR 25).
 *
 * `route home {populated,empty,loading,error}` covers every branch the API
 * decides, in both projects. Three things stay outside it:
 *
 * - The connected-tools grid has a middle width step. Each card is a full row
 *   at 390px and a third of one at 1440px, so the half-width band between
 *   40rem and 64rem is never captured — and that is exactly where a wrong
 *   order between the two migrated media queries would hide. A gallery case
 *   cannot reach it either, because a gallery section is laid out by the same
 *   viewport the project fixes, so this case sets its own width (PR 27).
 * - The three "All …" links and the skill and project rows are the route's own
 *   hover rules, which only a pointer reaches. Each is captured hovered, and
 *   then hovered again under a pointer that cannot hover, where Tailwind's
 *   `@media (hover: hover)` wrapper means no hover styling at all
 *   (`hover-media.spec.ts`).
 * - The empty branch's inline `Tools` button is the one underlined control on
 *   the page, and it exists only while no tool is detected.
 *
 * `routeshome` selects exactly these tests.
 */
test.describe('routeshome route local states', () => {
  for (const theme of THEMES) {
    test(`routeshome tools grid two column ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: 800, height: 900 })
      await gotoRoute(page, '/', { theme })
      await expectRouteShots(page, `routeshome-tools-grid-2col-${theme}`)
    })

    test(`routeshome hover targets ${theme}`, async ({ page }) => {
      await gotoRoute(page, '/', { theme })
      const main = page.locator('main').last()
      const allTools = main.getByRole('button', { name: 'All tools' })
      // The second section is the skill library one; its last child is the
      // list, whose first child is the first row.
      const skillRow = main.locator('section').nth(1).locator('> div').last().locator('> div')
      const firstSkillRow = skillRow.first()

      await allTools.hover()
      await expectShot(allTools, `routeshome-link-hover-${theme}.png`)
      await firstSkillRow.hover()
      await expectShot(firstSkillRow, `routeshome-row-hover-${theme}.png`)

      await emulateNoHover(page)
      await allTools.hover()
      await expectShot(allTools, `routeshome-link-no-hover-${theme}.png`)
      await firstSkillRow.hover()
      await expectShot(firstSkillRow, `routeshome-row-no-hover-${theme}.png`)
    })

    test(`routeshome empty link hover ${theme}`, async ({ page }) => {
      await gotoRoute(page, '/', { theme, data: 'empty' })
      const link = page.locator('main').last().getByRole('button', { name: 'Tools', exact: true })
      await link.hover()
      await expectShot(link, `routeshome-empty-link-hover-${theme}.png`)
    })
  }
})

/**
 * The settings route's one pointer-only state (PR 31).
 *
 * Each option row of the two radio groups carries a single hover rule. Nothing
 * else in the suite reaches it: the route matrix above never moves the pointer,
 * and `hover-media.spec.ts` only visits gallery sections, none of which mounts
 * this route. The second case emulates a pointer that cannot hover — the
 * shape PR 04 translated wrongly and PR 06 corrected — so a rule written
 * without its `@media (hover: hover)` wrapper paints the row here and fails.
 */
test.describe('settings option row', () => {
  for (const theme of THEMES) {
    const firstOptionRow = (page: Parameters<typeof gotoRoute>[0]) =>
      page.locator('[data-slot="radio-group"]').first().locator('> div').first()

    test(`routeset option hover ${theme}`, async ({ page }) => {
      await gotoRoute(page, '/settings', { theme })
      const row = firstOptionRow(page)
      await row.hover()
      await waitForAnimationsToFinish(page)
      await expectShot(row, `routeset-option-hover-${theme}.png`)
    })

    test(`routeset option no-hover ${theme}`, async ({ page }) => {
      await gotoRoute(page, '/settings', { theme })
      await emulateNoHover(page)
      const row = firstOptionRow(page)
      await row.hover()
      await waitForAnimationsToFinish(page)
      await expectShot(row, `routeset-option-no-hover-${theme}.png`)
    })
  }
})
