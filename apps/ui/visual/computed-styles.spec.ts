import { test, type Page } from '@playwright/test'
import { expectTextSnapshot, gotoRoute, THEMES } from './helpers'

/**
 * A pixel comparison can miss a cascade change that happens to render the same
 * at the captured states. These JSON snapshots pin the computed values and
 * element bounds of the elements the migration is most likely to disturb.
 */
const TRACKED_PROPERTIES = [
  'display',
  'position',
  'box-sizing',
  'width',
  'height',
  'margin',
  'padding',
  'gap',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'color',
  'background-color',
  'border-width',
  'border-style',
  'border-color',
  'border-radius',
  'box-shadow',
  'outline',
  'opacity',
  'z-index',
  'overflow',
  'transform',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
]

interface TrackedElement {
  id: string
  selector: string
}

const ELEMENTS: TrackedElement[] = [
  { id: 'body', selector: 'body' },
  { id: 'sidebar-container', selector: '[data-slot="sidebar-container"]' },
  { id: 'sidebar-inner', selector: '[data-slot="sidebar-inner"]' },
  {
    id: 'sidebar-menu-button-active',
    selector: '[data-slot="sidebar-menu-button"][data-active="true"]',
  },
  { id: 'header', selector: 'header' },
  { id: 'main', selector: 'main' },
  { id: 'primary-button', selector: '[data-slot="button"][data-variant="default"]' },
  { id: 'ghost-button', selector: '[data-slot="button"][data-variant="ghost"]' },
  { id: 'input', selector: '[data-slot="input"]' },
  { id: 'input-group', selector: '[data-slot="input-group"]' },
  { id: 'card', selector: '[data-slot="card"]' },
  { id: 'badge', selector: '[data-slot="badge"]' },
  { id: 'separator', selector: '[data-slot="separator"]' },
  { id: 'heading-h1', selector: 'h1' },
]

async function collect(page: Page): Promise<string> {
  const report = await page.evaluate(
    ({ elements, properties }) => {
      const round = (value: number) => Math.round(value * 100) / 100
      return elements.map(({ id, selector }) => {
        const element = document.querySelector(selector)
        if (!element) return { id, selector, present: false }
        const rect = element.getBoundingClientRect()
        const computed = getComputedStyle(element)
        const styles: Record<string, string> = {}
        for (const property of properties) {
          styles[property] = computed.getPropertyValue(property)
        }
        return {
          id,
          selector,
          present: true,
          box: {
            x: round(rect.x),
            y: round(rect.y),
            width: round(rect.width),
            height: round(rect.height),
          },
          styles,
        }
      })
    },
    { elements: ELEMENTS, properties: TRACKED_PROPERTIES }
  )

  return `${JSON.stringify(report, null, 2)}\n`
}

const ROUTES = [
  { id: 'home', path: '/' },
  { id: 'tools', path: '/tools' },
  { id: 'skill-library', path: '/skill-library' },
  { id: 'projects', path: '/projects' },
  { id: 'project-detail', path: '/projects/project-alpha' },
  { id: 'settings', path: '/settings' },
]

for (const route of ROUTES) {
  for (const theme of THEMES) {
    test(`computed styles ${route.id} ${theme}`, async ({ page }) => {
      await gotoRoute(page, route.path, { theme })
      await expectTextSnapshot(await collect(page), `computed-${route.id}-${theme}.json`)
    })
  }
}

for (const theme of THEMES) {
  test(`computed styles gallery buttons ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/buttons', {
      theme,
      waitFor: '[data-gallery-section="buttons"]',
    })
    await expectTextSnapshot(await collect(page), `computed-gallery-buttons-${theme}.json`)
  })

  test(`computed styles gallery forms ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/forms', {
      theme,
      waitFor: '[data-gallery-section="forms"]',
    })
    await expectTextSnapshot(await collect(page), `computed-gallery-forms-${theme}.json`)
  })
}
