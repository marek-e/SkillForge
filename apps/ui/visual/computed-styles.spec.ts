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

/**
 * Every custom property the project declares on `:root` (and overrides in
 * `.dark`). Snapshotting them catches a token whose literal, whose `.dark`
 * override or whose cascade position moved, which no screenshot of a component
 * would necessarily show.
 *
 * Each one is read back *through a probe element* rather than as the raw
 * declaration text, because the raw text is not stable across pipelines:
 * lightningcss rewrites `oklch(1 0 0)` to `oklch(100% 0 0)` and `0.625rem` to
 * `.625rem` when it minifies the production bundle, while the value the browser
 * resolves is the same in both. `--radius` is a length, so it is probed as a
 * width; everything else is a colour.
 */
const THEME_PROPERTIES = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--border',
  '--input',
  '--ring',
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
  '--radius',
  '--sidebar',
  '--sidebar-foreground',
  '--sidebar-primary',
  '--sidebar-primary-foreground',
  '--sidebar-accent',
  '--sidebar-accent-foreground',
  '--sidebar-border',
  '--sidebar-ring',
  '--toaster-background',
]

/**
 * The tokens gallery renders one element per token through
 * `src/styles/tokens.stylex.ts`, so reading these back resolves the whole
 * chain: StyleX var alias -> project custom property -> `:root`/`.dark` value.
 */
async function collectTokens(page: Page): Promise<string> {
  const report = await page.evaluate((properties) => {
    const probe = document.createElement('div')
    probe.style.position = 'absolute'
    probe.style.visibility = 'hidden'
    document.body.append(probe)
    const resolve = (property: string) => {
      const asLength = property === '--radius'
      const target = asLength ? 'width' : 'color'
      probe.style.setProperty(target, `var(${property})`)
      const value = getComputedStyle(probe)[asLength ? 'width' : 'color']
      probe.style.removeProperty(target)
      return value
    }
    const resolved = Object.fromEntries(properties.map((p) => [p, resolve(p)]))
    probe.remove()

    const read = (selector: string, attribute: string, props: string[]) =>
      Object.fromEntries(
        [...document.querySelectorAll(selector)].map((element) => {
          const computed = getComputedStyle(element)
          return [
            element.getAttribute(attribute),
            Object.fromEntries(props.map((prop) => [prop, computed.getPropertyValue(prop)])),
          ]
        })
      )

    return {
      rootClass: document.documentElement.className,
      rootProperties: resolved,
      swatchFills: read('[data-token-fill]', 'data-token-fill', ['background-color']),
      swatchTexts: read('[data-token-text]', 'data-token-text', ['color']),
      radii: read('[data-radius]', 'data-radius', ['border-radius']),
      fonts: read('[data-font]', 'data-font', ['font-family']),
      motion: read('[data-motion]', 'data-motion', [
        'transition-property',
        'transition-duration',
        'transition-timing-function',
      ]),
    }
  }, THEME_PROPERTIES)

  return `${JSON.stringify(report, null, 2)}\n`
}

/**
 * Properties that only the base layer sets on an element carrying no class at
 * all: preflight plus the project's own `@layer base` rules.
 */
const NATIVE_PROPERTIES = [
  'font-family',
  'font-size',
  'line-height',
  'color',
  'background-color',
  'border-color',
  'border-width',
  'border-style',
  'outline-color',
  'outline-style',
  'outline-width',
  'margin',
  'padding',
  'box-sizing',
  '-webkit-tap-highlight-color',
]

const NATIVE_CASE = '[data-gallery-case="native-defaults"]'

const NATIVE_ELEMENTS: TrackedElement[] = [
  { id: 'html', selector: 'html' },
  { id: 'body', selector: 'body' },
  { id: 'div', selector: `${NATIVE_CASE} > div > div` },
  { id: 'button', selector: `${NATIVE_CASE} button` },
  { id: 'input', selector: `${NATIVE_CASE} input` },
  { id: 'textarea', selector: `${NATIVE_CASE} textarea` },
  { id: 'select', selector: `${NATIVE_CASE} select` },
  { id: 'a', selector: `${NATIVE_CASE} a` },
  { id: 'hr', selector: `${NATIVE_CASE} hr` },
  { id: 'h1', selector: `${NATIVE_CASE} h1` },
  { id: 'p', selector: `${NATIVE_CASE} p` },
]

async function collectNativeDefaults(page: Page): Promise<string> {
  const report = await page.evaluate(
    ({ elements, properties }) =>
      elements.map(({ id, selector }) => {
        const element = document.querySelector(selector)
        if (!element) return { id, selector, present: false }
        const computed = getComputedStyle(element)
        const styles: Record<string, string> = {}
        for (const property of properties) {
          styles[property] = computed.getPropertyValue(property)
        }
        return { id, selector, present: true, styles }
      }),
    { elements: NATIVE_ELEMENTS, properties: NATIVE_PROPERTIES }
  )

  return `${JSON.stringify(report, null, 2)}\n`
}

for (const theme of THEMES) {
  test(`computed styles gallery tokens ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/tokens', {
      theme,
      waitFor: '[data-gallery-section="tokens"]',
    })
    await expectTextSnapshot(await collectTokens(page), `computed-tokens-${theme}.json`)
    await expectTextSnapshot(
      await collectNativeDefaults(page),
      `computed-native-defaults-${theme}.json`
    )
  })
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

/**
 * Typography (PR 03).
 *
 * The 12 typography components are pure text styling, so a pixel comparison can
 * only prove that the glyphs landed in the same place — it says nothing about
 * *which* declaration put them there. These snapshots pin the values the
 * migration translates by hand: the paired `font-size`/`line-height` of every
 * `text-*` step, `letter-spacing`, `scroll-margin` (`scroll-m-20`, which nothing
 * renders until an anchor jump), the sibling margins (`[&:not(:first-child)]:mt-6`,
 * `first:mt-0`, `mt-6`) and the two code variants' box.
 */
const TYPOGRAPHY_PROPERTIES = [
  'display',
  'position',
  'width',
  'margin',
  'padding',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'color',
  'background-color',
  'border-width',
  'border-style',
  'border-color',
  'border-radius',
  'overflow-x',
  'scroll-margin',
  'text-wrap-mode',
  'text-wrap-style',
  'white-space',
]

const TYPOGRAPHY_ELEMENTS: TrackedElement[] = [
  { id: 'h1', selector: '[data-gallery-case="typography-h1"] h1' },
  { id: 'h2', selector: '[data-gallery-case="typography-h2"] h2' },
  { id: 'h3', selector: '[data-gallery-case="typography-h3"] h3' },
  { id: 'h4', selector: '[data-gallery-case="typography-h4"] h4' },
  { id: 'h5', selector: '[data-gallery-case="typography-h5"] h5' },
  { id: 'h6', selector: '[data-gallery-case="typography-h6"] h6' },
  { id: 'p', selector: '[data-gallery-case="typography-p"] p' },
  { id: 'p-stacked-first', selector: '[data-gallery-case="typography-p-stacked"] p:first-child' },
  { id: 'p-stacked-second', selector: '[data-gallery-case="typography-p-stacked"] p:nth-child(2)' },
  { id: 'lead', selector: '[data-gallery-case="typography-lead"] p' },
  { id: 'large', selector: '[data-gallery-case="typography-large"] > div' },
  { id: 'small', selector: '[data-gallery-case="typography-small"] small' },
  { id: 'muted', selector: '[data-gallery-case="typography-muted"] p' },
  { id: 'blockquote', selector: '[data-gallery-case="typography-blockquote"] blockquote' },
  { id: 'code-inline', selector: '[data-gallery-case="typography-code-inline"] code' },
  { id: 'code-block', selector: '[data-gallery-case="typography-code-block"] pre' },
  { id: 'h1-override', selector: '[data-gallery-case="typography-h1-override"] h1' },
  { id: 'muted-override', selector: '[data-gallery-case="typography-muted-override"] p' },
]

const TYPOGRAPHY_EXTRA_ELEMENTS: TrackedElement[] = [
  { id: 'h2-flow-first', selector: '[data-gallery-case="typography-h2-in-flow"] h2:first-child' },
  { id: 'p-flow-second', selector: '[data-gallery-case="typography-h2-in-flow"] p:nth-child(2)' },
  { id: 'h2-flow-third', selector: '[data-gallery-case="typography-h2-in-flow"] h2:nth-child(3)' },
  { id: 'p-flow-fourth', selector: '[data-gallery-case="typography-h2-in-flow"] p:nth-child(4)' },
  { id: 'p-only-child', selector: '[data-gallery-case="typography-p-only-child"] p' },
  {
    id: 'blockquote-after-p',
    selector: '[data-gallery-case="typography-blockquote-after-p"] blockquote',
  },
  { id: 'code-in-paragraph', selector: '[data-gallery-case="typography-code-in-paragraph"] code' },
  {
    id: 'code-block-overflow',
    selector: '[data-gallery-case="typography-code-block-overflow"] pre',
  },
  { id: 'h2-flex-override', selector: '[data-gallery-case="typography-h2-flex-override"] h2' },
  { id: 'h1-size-override', selector: '[data-gallery-case="typography-h1-size-override"] h1' },
  { id: 'p-override', selector: '[data-gallery-case="typography-p-override"] p' },
  { id: 'code-override', selector: '[data-gallery-case="typography-code-override"] code' },
  {
    id: 'blockquote-override',
    selector: '[data-gallery-case="typography-blockquote-override"] blockquote',
  },
  {
    id: 'code-block-override',
    selector: '[data-gallery-case="typography-code-block-override"] pre',
  },
]

async function collectTypography(page: Page, elements: TrackedElement[]): Promise<string> {
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
          box: { width: round(rect.width), height: round(rect.height) },
          styles,
        }
      })
    },
    { elements, properties: TYPOGRAPHY_PROPERTIES }
  )

  return `${JSON.stringify(report, null, 2)}\n`
}

for (const theme of THEMES) {
  test(`computed styles gallery typography ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/typography', {
      theme,
      waitFor: '[data-gallery-section="typography"]',
    })
    await expectTextSnapshot(
      await collectTypography(page, TYPOGRAPHY_ELEMENTS),
      `computed-typography-${theme}.json`
    )
  })

  test(`computed styles gallery typography-extra ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/typography-extra', {
      theme,
      waitFor: '[data-gallery-section="typography-extra"]',
    })
    await expectTextSnapshot(
      await collectTypography(page, TYPOGRAPHY_EXTRA_ELEMENTS),
      `computed-typography-extra-${theme}.json`
    )
  })
}

/**
 * Buttons, groups, badges and toggles (PR 04).
 *
 * Two collectors, because the risky parts are different in kind:
 *
 * - `collectButtonMatrix` dumps one button per variant/size plus the badge and
 *   toggle variants, which pins the `cva` string's plain declarations (box,
 *   colour, radius, the per-size arbitrary `min()` radius).
 * - `collectGroupChildren` walks **every direct child** of each button group and
 *   dumps its four corner radii, four border widths and stacking, which is the
 *   only way to see the child-edge rules
 *   (the `:not(:first-child)` and `:not(:last-child)` corner and border rules,
 *   and the `!important` last-`[data-slot]`-child radius rule) resolve against
 *   each other and against the button's own `in-data-[slot=button-group]` radius.
 */
const BUTTON_PROPERTIES = [
  'display',
  'width',
  'height',
  'padding',
  'gap',
  'font-size',
  'line-height',
  'font-weight',
  'color',
  'background-color',
  'background-clip',
  'border-width',
  'border-style',
  'border-color',
  'border-radius',
  'box-shadow',
  'outline',
  'opacity',
  'pointer-events',
  'user-select',
  'white-space',
  'flex-shrink',
  'align-items',
  'justify-content',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
  'overflow',
]

const GROUP_CHILD_PROPERTIES = [
  'display',
  'position',
  'z-index',
  'width',
  'height',
  'flex',
  'align-self',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-color',
  'background-color',
  'margin',
  'padding',
]

const GROUP_CASES = [
  'button-group-two',
  'button-group-text-last',
  'button-group-text-both',
  'button-group-xs',
  'button-group-sm',
  'button-group-icon-xs',
  'button-group-icon-sm',
  'button-group-nested',
  'button-group-input',
  'button-group-select',
  'button-group-vertical-two',
  'button-group-vertical-text-last',
  'button-group-vertical-separator',
  'button-group-mixed-variants',
]

async function collectCases(page: Page, selector: string, properties: string[]): Promise<string> {
  const report = await page.evaluate(
    ({ selector, properties }) => {
      const round = (value: number) => Math.round(value * 100) / 100
      return [...document.querySelectorAll(selector)].map((element) => {
        const caseElement = element.closest('[data-gallery-case]')
        const rect = element.getBoundingClientRect()
        const computed = getComputedStyle(element)
        const styles: Record<string, string> = {}
        for (const property of properties) {
          styles[property] = computed.getPropertyValue(property)
        }
        return {
          case: caseElement?.getAttribute('data-gallery-case') ?? '',
          tag: element.tagName.toLowerCase(),
          slot: element.getAttribute('data-slot'),
          variant: element.getAttribute('data-variant'),
          size: element.getAttribute('data-size'),
          box: { width: round(rect.width), height: round(rect.height) },
          styles,
        }
      })
    },
    { selector, properties }
  )

  return `${JSON.stringify(report, null, 2)}\n`
}

async function collectGroupChildren(page: Page): Promise<string> {
  const report = await page.evaluate(
    ({ cases, properties }) => {
      const round = (value: number) => Math.round(value * 100) / 100
      return cases.map((name) => {
        const group = document.querySelector(`[data-gallery-case="${name}"] > *`)
        if (!group) return { case: name, present: false }
        const children = [...group.children].map((child, index) => {
          const rect = child.getBoundingClientRect()
          const computed = getComputedStyle(child)
          const styles: Record<string, string> = {}
          for (const property of properties) {
            styles[property] = computed.getPropertyValue(property)
          }
          return {
            index,
            tag: child.tagName.toLowerCase(),
            slot: child.getAttribute('data-slot'),
            box: { width: round(rect.width), height: round(rect.height) },
            styles,
          }
        })
        const groupComputed = getComputedStyle(group)
        return {
          case: name,
          present: true,
          group: {
            display: groupComputed.display,
            flexDirection: groupComputed.flexDirection,
            alignItems: groupComputed.alignItems,
            gap: groupComputed.gap,
            width: groupComputed.width,
            orientation: group.getAttribute('data-orientation'),
          },
          children,
        }
      })
    },
    { cases: GROUP_CASES, properties: GROUP_CHILD_PROPERTIES }
  )

  return `${JSON.stringify(report, null, 2)}\n`
}

for (const theme of THEMES) {
  test(`computed styles gallery buttons-extra ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/buttons-extra', {
      theme,
      waitFor: '[data-gallery-section="buttons-extra"]',
    })
    await expectTextSnapshot(
      await collectCases(page, '[data-gallery-case] [data-slot="button"]', BUTTON_PROPERTIES),
      `computed-buttons-matrix-${theme}.json`
    )
    await expectTextSnapshot(
      await collectCases(
        page,
        '[data-gallery-case] [data-slot="badge"], [data-gallery-case] [data-slot="toggle"]',
        BUTTON_PROPERTIES
      ),
      `computed-badges-toggles-${theme}.json`
    )
    await expectTextSnapshot(
      await collectGroupChildren(page),
      `computed-button-group-edges-${theme}.json`
    )
  })
}
