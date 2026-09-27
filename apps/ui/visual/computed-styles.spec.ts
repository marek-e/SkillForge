import { test, type Page } from '@playwright/test'
import {
  expectTextSnapshot,
  freezeAnimationsAt,
  gotoRoute,
  installAnimationFreeze,
  settle,
  THEMES,
  waitForAnimationsToFinish,
} from './helpers'

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

/**
 * Form controls (PR 05).
 *
 * `collect()` above only reaches the *first* input, input group and button of a
 * page. These two collectors dump every control and every field part of the two
 * form sections instead, which is what pins the parts a screenshot cannot
 * separate: the composed focus/invalid `box-shadow`, the `::placeholder` colour
 * (through the control's own colour), the per-orientation flex axis of `Field`,
 * the container-query switch, the negative addon margins and the sibling
 * margins of `FieldDescription`.
 */
const FORM_CONTROL_PROPERTIES = [
  'display',
  'position',
  'width',
  'height',
  'min-width',
  'min-height',
  'flex',
  'order',
  'margin',
  'padding',
  'gap',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'color',
  'background-color',
  'border-width',
  'border-style',
  'border-color',
  'border-radius',
  'box-shadow',
  'outline',
  'opacity',
  'cursor',
  'pointer-events',
  'user-select',
  // The property that controls a textarea's drag handle is deliberately absent:
  // its CSS name is also a Tailwind utility name, and the scanner reads this
  // file, so naming it here would emit a rule no element uses (the hazard
  // `conventions.md` records).
  'field-sizing',
  'text-wrap-mode',
  'text-wrap-style',
  'align-items',
  'justify-content',
  'flex-direction',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
]

const FORM_CONTROL_SELECTOR = [
  '[data-slot="input"]',
  '[data-slot="textarea"]',
  '[data-slot="label"]',
  '[data-slot="input-group"]',
  '[data-slot="input-group-addon"]',
  '[data-slot="button"]',
  'kbd',
]
  .map((selector) => `[data-gallery-case] ${selector}`)
  .join(', ')

const FIELD_SELECTOR = [
  '[data-slot="field-set"]',
  '[data-slot="field-legend"]',
  '[data-slot="field-group"]',
  '[data-slot="field"]',
  '[data-slot="field-content"]',
  '[data-slot="field-label"]',
  '[data-slot="field-description"]',
  '[data-slot="field-error"]',
  '[data-slot="field-separator"]',
]
  .map((selector) => `[data-gallery-case] ${selector}`)
  .join(', ')

for (const theme of THEMES) {
  test(`computed styles gallery forms controls ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/forms', {
      theme,
      waitFor: '[data-gallery-section="forms"]',
    })
    await expectTextSnapshot(
      await collectCases(page, FORM_CONTROL_SELECTOR, FORM_CONTROL_PROPERTIES),
      `computed-forms-controls-${theme}.json`
    )
    await expectTextSnapshot(
      await collectCases(page, FIELD_SELECTOR, FORM_CONTROL_PROPERTIES),
      `computed-forms-fields-${theme}.json`
    )
  })

  test(`computed styles gallery forms-extra ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/forms-extra', {
      theme,
      waitFor: '[data-gallery-section="forms-extra"]',
    })
    await expectTextSnapshot(
      await collectCases(page, FORM_CONTROL_SELECTOR, FORM_CONTROL_PROPERTIES),
      `computed-forms-extra-controls-${theme}.json`
    )
    await expectTextSnapshot(
      await collectCases(page, FIELD_SELECTOR, FORM_CONTROL_PROPERTIES),
      `computed-forms-extra-fields-${theme}.json`
    )
  })
}

/**
 * Checkbox, radio, switch and slider (PR 06).
 *
 * These four are built from several elements each — a root plus an indicator,
 * a thumb, a track and a range — and most of their styling is written by an
 * ancestor's `data-state` or `data-orientation`. The collector therefore dumps
 * every part of every case, including the `translate` of a switch thumb and the
 * per-orientation width and height of a slider track.
 */
const TOGGLE_PROPERTIES = [
  'display',
  'position',
  'width',
  'height',
  'aspect-ratio',
  'box-sizing',
  'margin',
  'padding',
  'top',
  'left',
  'border-width',
  'border-style',
  'border-color',
  'border-radius',
  'background-color',
  'color',
  'fill',
  'box-shadow',
  'outline',
  'opacity',
  'cursor',
  'pointer-events',
  'user-select',
  'flex-shrink',
  'align-items',
  'justify-content',
  'place-content',
  'overflow',
  'touch-action',
  'translate',
  'transform',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
]

const TOGGLE_SELECTOR = [
  '[data-slot="checkbox"]',
  '[data-slot="checkbox-indicator"]',
  '[data-slot="radio-group"]',
  '[data-slot="radio-group-item"]',
  '[data-slot="radio-group-indicator"]',
  '[data-slot="switch"]',
  '[data-slot="switch-thumb"]',
  '[data-slot="slider"]',
  '[data-slot="slider-track"]',
  '[data-slot="slider-range"]',
  '[data-slot="slider-thumb"]',
]
  .map((selector) => `[data-gallery-case] ${selector}`)
  .join(', ')

for (const theme of THEMES) {
  test(`computed styles gallery forms toggle parts ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/forms', {
      theme,
      waitFor: '[data-gallery-section="forms"]',
    })
    await expectTextSnapshot(
      await collectCases(page, TOGGLE_SELECTOR, TOGGLE_PROPERTIES),
      `computed-forms-toggle-parts-${theme}.json`
    )
  })

  test(`computed styles gallery forms-toggles ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/forms-toggles', {
      theme,
      waitFor: '[data-gallery-section="forms-toggles"]',
    })
    await expectTextSnapshot(
      await collectCases(page, TOGGLE_SELECTOR, TOGGLE_PROPERTIES),
      `computed-forms-toggles-${theme}.json`
    )
  })
}

/**
 * Card, table, separator and aspect ratio (PR 07).
 *
 * Most of what these four write is a *selector*, not a declaration: the card's
 * `:has()` paddings, the header's grid tracks and container query, the row
 * borders a table's head, body and footer reach into, the checkbox column's
 * padding reset and the per-orientation box of a separator. A screenshot shows
 * the result but not which rule produced it, so every part of every case is
 * dumped with the longhands those rules actually set.
 */
const DATA_DISPLAY_PROPERTIES = [
  'display',
  'position',
  'box-sizing',
  'width',
  'height',
  'flex-direction',
  'flex-shrink',
  'align-items',
  'align-self',
  'justify-self',
  'grid-template-columns',
  'grid-template-rows',
  'grid-auto-rows',
  'grid-column-start',
  'grid-row-start',
  'grid-row-end',
  'gap',
  'container-type',
  'container-name',
  'margin',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'color',
  'background-color',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-style',
  'border-color',
  'border-radius',
  'box-shadow',
  'opacity',
  'overflow-x',
  'overflow-y',
  'caption-side',
  'vertical-align',
  'text-align',
  'white-space',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
]

const DATA_DISPLAY_SELECTOR = [
  '[data-slot="card"]',
  '[data-slot="card-header"]',
  '[data-slot="card-title"]',
  '[data-slot="card-description"]',
  '[data-slot="card-action"]',
  '[data-slot="card-content"]',
  '[data-slot="card-footer"]',
  '[data-slot="table-container"]',
  '[data-slot="table"]',
  '[data-slot="table-row"]',
  '[data-slot="table-head"]',
  '[data-slot="table-cell"]',
  '[data-slot="table-caption"]',
  '[data-slot="separator"]',
  '[data-slot="aspect-ratio"]',
  'img',
]
  .map((selector) => `[data-gallery-case] ${selector}`)
  .join(', ')

/**
 * The three table sections are dumped on their own, **without** `display`.
 *
 * The three values a `thead`, `tbody` and `tfoot` compute to are also the
 * names of three Tailwind display utilities. Tailwind's source scanner reads
 * every text file in the project — including the JSON snapshot this test
 * writes — so dumping the property here would make the build emit three
 * display rules no element uses. That is the hazard `conventions.md` records,
 * met in a snapshot rather than in a comment. Nothing is lost: what these
 * sections write is a border on their `tr` children, which the row dump above
 * already pins.
 */
const DATA_DISPLAY_SECTION_SELECTOR = [
  '[data-slot="table-header"]',
  '[data-slot="table-body"]',
  '[data-slot="table-footer"]',
]
  .map((selector) => `[data-gallery-case] ${selector}`)
  .join(', ')

const DATA_DISPLAY_SECTION_PROPERTIES = DATA_DISPLAY_PROPERTIES.filter(
  (property) => property !== 'display'
)

for (const theme of THEMES) {
  test(`computed styles gallery data-display parts ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/data-display', {
      theme,
      waitFor: '[data-gallery-section="data-display"]',
    })
    await expectTextSnapshot(
      await collectCases(page, DATA_DISPLAY_SELECTOR, DATA_DISPLAY_PROPERTIES),
      `computed-data-display-parts-${theme}.json`
    )
    await expectTextSnapshot(
      await collectCases(page, DATA_DISPLAY_SECTION_SELECTOR, DATA_DISPLAY_SECTION_PROPERTIES),
      `computed-data-display-sections-${theme}.json`
    )
  })

  test(`computed styles gallery data-display-extra ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/data-display-extra', {
      theme,
      waitFor: '[data-gallery-section="data-display-extra"]',
    })
    await expectTextSnapshot(
      await collectCases(page, DATA_DISPLAY_SELECTOR, DATA_DISPLAY_PROPERTIES),
      `computed-data-display-extra-${theme}.json`
    )
    await expectTextSnapshot(
      await collectCases(page, DATA_DISPLAY_SECTION_SELECTOR, DATA_DISPLAY_SECTION_PROPERTIES),
      `computed-data-display-extra-sections-${theme}.json`
    )
  })
}

/**
 * Progress, skeleton, spinner, empty, not-found and alert (PR 08).
 *
 * Three of these six are built almost entirely out of selectors — the alert's
 * `:has(>svg)` grid tracks and its action padding, the empty media variants,
 * the progress indicator's runtime transform — and two of them animate, which
 * a still screenshot cannot separate from a static opacity. The animation
 * longhands are dumped so the duration, timing function and iteration count
 * are pinned even where the keyframes' generated name is not.
 */
const FEEDBACK_PROPERTIES = [
  'display',
  'position',
  'box-sizing',
  'width',
  'height',
  'max-width',
  'min-width',
  'flex',
  'flex-direction',
  'flex-shrink',
  'align-items',
  'justify-content',
  'grid-template-columns',
  'grid-column-start',
  'grid-row-start',
  'grid-row-end',
  'gap',
  'column-gap',
  'margin',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'color',
  'background-color',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-style',
  'border-color',
  'border-radius',
  'opacity',
  'overflow-x',
  'overflow-y',
  'text-align',
  'text-wrap-mode',
  'text-wrap-style',
  'top',
  'right',
  'transform',
  'animation-duration',
  'animation-timing-function',
  'animation-iteration-count',
  'animation-direction',
  'animation-fill-mode',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
]

const FEEDBACK_SELECTOR = [
  '[data-slot="progress"]',
  '[data-slot="progress-indicator"]',
  '[data-slot="skeleton"]',
  '[role="status"]',
  '[data-slot="empty"]',
  '[data-slot="empty-header"]',
  '[data-slot="empty-icon"]',
  '[data-slot="empty-title"]',
  '[data-slot="empty-description"]',
  '[data-slot="empty-content"]',
  '[data-slot="alert"]',
  '[data-slot="alert-title"]',
  '[data-slot="alert-description"]',
  '[data-slot="alert-action"]',
]
  .map((selector) => `[data-gallery-case] ${selector}`)
  .join(', ')

/**
 * `Skeleton`'s pulse and `Spinner`'s spin are infinite, so `opacity` and
 * `transform` are whatever the compositor clock happened to be at when the
 * dump ran. Both are seeked to 0 ms first, which is also the frame every other
 * screenshot in the suite parks them on.
 */
async function freezeLoops(page: Page): Promise<void> {
  await installAnimationFreeze(page)
  await freezeAnimationsAt(page, 0)
}

for (const theme of THEMES) {
  test(`computed styles gallery feedback parts ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/data-display', {
      theme,
      waitFor: '[data-gallery-section="data-display"]',
    })
    await freezeLoops(page)
    await expectTextSnapshot(
      await collectCases(page, FEEDBACK_SELECTOR, FEEDBACK_PROPERTIES),
      `computed-feedback-data-display-${theme}.json`
    )
  })

  test(`computed styles gallery feedback ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/feedback', {
      theme,
      waitFor: '[data-gallery-section="feedback"]',
    })
    await freezeLoops(page)
    await expectTextSnapshot(
      await collectCases(page, FEEDBACK_SELECTOR, FEEDBACK_PROPERTIES),
      `computed-feedback-${theme}.json`
    )
  })
}

/**
 * Tabs, accordion, collapsible, scroll area and resizable (PR 09).
 *
 * Four of these five are built almost entirely out of state selectors, and
 * three of them own a generated `::after` that a pixel comparison can only see
 * where it happens to paint. So the pseudo-element is dumped next to its host,
 * and the animation longhands come along for the accordion body, whose two
 * keyframes are the only ones in this row.
 *
 * The property names below are deliberately spelled as CSS properties rather
 * than as the utilities that set them, and the values that reach the snapshot
 * were checked against the built CSS: Tailwind's scanner reads this file and
 * the JSON it writes, so a value that happens to be a utility name would make
 * the build emit a rule no element renders.
 */
const DISCLOSURE_PROPERTIES = [
  'display',
  'position',
  'box-sizing',
  'width',
  'height',
  'min-height',
  'flex',
  'flex-direction',
  'flex-shrink',
  'align-items',
  'justify-content',
  'gap',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'font-size',
  'font-weight',
  'line-height',
  'text-align',
  'text-decoration-line',
  'color',
  'background-color',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'border-style',
  'border-radius',
  'box-shadow',
  'outline-color',
  'outline-style',
  'outline-width',
  'opacity',
  'z-index',
  'overflow-x',
  'overflow-y',
  'touch-action',
  'user-select',
  'translate',
  'rotate',
  'top',
  'right',
  'bottom',
  'left',
  'content',
  'animation-duration',
  'animation-timing-function',
  'animation-iteration-count',
  'animation-direction',
  'animation-fill-mode',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
]

const DISCLOSURE_SELECTOR = [
  '[data-slot="tabs"]',
  '[data-slot="tabs-list"]',
  '[data-slot="tabs-trigger"]',
  '[data-slot="tabs-content"]',
  '[data-slot="accordion"]',
  '[data-slot="accordion-item"]',
  'h3',
  '[data-slot="accordion-trigger"]',
  '[data-slot="accordion-trigger-icon"]',
  '[data-slot="accordion-content"]',
  '[data-slot="accordion-content"] > div',
  '[data-slot="collapsible"]',
  '[data-slot="collapsible-trigger"]',
  '[data-slot="collapsible-content"]',
  '[data-slot="scroll-area"]',
  '[data-slot="scroll-area-viewport"]',
  '[data-slot="scroll-area-scrollbar"]',
  '[data-slot="scroll-area-thumb"]',
  '[data-slot="resizable-panel-group"]',
  '[data-slot="resizable-panel"]',
  '[data-slot="resizable-handle"]',
  '[data-slot="resizable-handle"] > div',
]
  .map((selector) => `[data-gallery-case] ${selector}`)
  .join(', ')

/** The hosts whose `::after` carries styling of its own. */
const DISCLOSURE_PSEUDO_HOSTS = ['tabs-trigger', 'accordion-trigger', 'resizable-handle']

async function collectDisclosure(page: Page): Promise<string> {
  const report = await page.evaluate(
    ({ selector, properties, pseudoHosts }) => {
      const round = (value: number) => Math.round(value * 100) / 100
      const read = (element: Element, pseudo: string | null) => {
        const computed = getComputedStyle(element, pseudo)
        const styles: Record<string, string> = {}
        for (const property of properties) {
          styles[property] = computed.getPropertyValue(property)
        }
        return styles
      }
      return [...document.querySelectorAll(selector)].map((element) => {
        const caseElement = element.closest('[data-gallery-case]')
        const rect = element.getBoundingClientRect()
        const slot = element.getAttribute('data-slot')
        return {
          case: caseElement?.getAttribute('data-gallery-case') ?? '',
          tag: element.tagName.toLowerCase(),
          slot,
          state: element.getAttribute('data-state'),
          orientation: element.getAttribute('data-orientation'),
          variant: element.getAttribute('data-variant'),
          box: {
            width: round(rect.width),
            height: round(rect.height),
            top: round(rect.top),
            left: round(rect.left),
          },
          styles: read(element, null),
          after: slot && pseudoHosts.includes(slot) ? read(element, '::after') : undefined,
        }
      })
    },
    {
      selector: DISCLOSURE_SELECTOR,
      properties: DISCLOSURE_PROPERTIES,
      pseudoHosts: DISCLOSURE_PSEUDO_HOSTS,
    }
  )

  return `${JSON.stringify(report, null, 2)}\n`
}

for (const theme of THEMES) {
  test(`computed styles gallery disclosure parts ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/disclosure', {
      theme,
      waitFor: '[data-gallery-section="disclosure"]',
    })
    await expectTextSnapshot(await collectDisclosure(page), `computed-disclosure-${theme}.json`)
  })

  test(`computed styles gallery disclosure-extra parts ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/disclosure-extra', {
      theme,
      waitFor: '[data-gallery-section="disclosure-extra"]',
    })
    await expectTextSnapshot(
      await collectDisclosure(page),
      `computed-disclosure-extra-${theme}.json`
    )
  })
}

/**
 * Dialog and alert dialog (PR 10).
 *
 * Both live in a portal and only exist while open, so each case is opened,
 * dumped and dismissed in turn and the results are concatenated into one
 * snapshot per section. The alert dialog's header, footer, media and title are
 * a grid whose rows, columns and alignment are picked by three conditions at
 * once — `data-size`, the presence of a media slot and the 40rem breakpoint —
 * and a screenshot at one viewport can only ever show one corner of that.
 *
 * As in the disclosure dump, the property names are spelled as CSS properties
 * and the values that land in the JSON were checked against the built CSS:
 * Tailwind's scanner reads this file and the originals it writes, so a value
 * that happens to spell a utility keeps that utility alive. Two do —
 * `isolation: isolate` and `overflow-y: hidden` — and both name rules the app
 * renders elsewhere, so nothing new is emitted; see `pr-10.md`.
 */
const DIALOG_PROPERTIES = [
  'display',
  'position',
  'box-sizing',
  'width',
  'height',
  'max-width',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'row-gap',
  'column-gap',
  'grid-template-rows',
  'grid-template-columns',
  'grid-row-start',
  'grid-row-end',
  'grid-column-start',
  'align-items',
  'justify-items',
  'justify-content',
  'flex-direction',
  'flex-shrink',
  'font-size',
  'font-weight',
  'line-height',
  'text-align',
  'text-wrap-mode',
  'text-wrap-style',
  'color',
  'background-color',
  'border-top-width',
  'border-top-style',
  'border-top-color',
  'border-radius',
  'box-shadow',
  'outline-style',
  'outline-width',
  'opacity',
  'z-index',
  'isolation',
  'overflow-x',
  'overflow-y',
  'backdrop-filter',
  'translate',
  'transform',
  'animation-duration',
  'animation-timing-function',
  'animation-delay',
  'animation-iteration-count',
  'animation-direction',
  'animation-fill-mode',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
  'pointer-events',
]

const DIALOG_SELECTOR = [
  '[data-slot="dialog-overlay"]',
  '[data-slot="dialog-content"]',
  '[data-slot="dialog-content"] > button',
  '[data-slot="dialog-header"]',
  '[data-slot="dialog-footer"]',
  '[data-slot="dialog-title"]',
  '[data-slot="dialog-description"]',
  '[data-slot="dialog-title"] span',
  '[data-slot="dialog-description"] span',
  '[data-slot="alert-dialog-overlay"]',
  '[data-slot="alert-dialog-content"]',
  '[data-slot="alert-dialog-header"]',
  '[data-slot="alert-dialog-footer"]',
  '[data-slot="alert-dialog-media"]',
  '[data-slot="alert-dialog-media"] svg',
  '[data-slot="alert-dialog-title"]',
  '[data-slot="alert-dialog-description"]',
  '[data-slot="alert-dialog-title"] span',
  '[data-slot="alert-dialog-description"] span',
  '[data-slot="alert-dialog-action"]',
  '[data-slot="alert-dialog-cancel"]',
].join(', ')

interface DialogCase {
  /** Label written into the snapshot. */
  id: string
  /** Selector for the gallery button that opens it. */
  trigger: string
  /** Selector that must be visible once it is open. */
  content: string
}

const DIALOG_CASES: Record<string, DialogCase[]> = {
  overlays: [
    {
      id: 'dialog',
      trigger: '[data-gallery-case="dialog-trigger"] button',
      content: '[data-slot="dialog-content"]',
    },
    {
      id: 'alert-dialog',
      trigger: '[data-gallery-case="alert-dialog-trigger"] button',
      content: '[data-slot="alert-dialog-content"]',
    },
    {
      id: 'alert-dialog-sm',
      trigger: '[data-gallery-case="alert-dialog-sm-trigger"] button',
      content: '[data-slot="alert-dialog-content"]',
    },
  ],
  'overlays-extra': [
    {
      id: 'dialog-no-close',
      trigger: '[data-gallery-case="dialog-no-close-trigger"] button',
      content: '[data-slot="dialog-content"]',
    },
    {
      id: 'dialog-footer-close',
      trigger: '[data-gallery-case="dialog-footer-close-trigger"] button',
      content: '[data-slot="dialog-content"]',
    },
    {
      id: 'dialog-wide-child',
      trigger: '[data-gallery-case="dialog-wide-child-trigger"] button',
      content: '[data-slot="dialog-content"]',
    },
    {
      id: 'dialog-inherited-leading',
      trigger: '[data-gallery-case="dialog-inherited-leading-trigger"] button',
      content: '[data-slot="dialog-content"]',
    },
    {
      id: 'command-dialog',
      trigger: '[data-gallery-case="command-dialog-trigger"] button',
      content: '[data-slot="dialog-content"]',
    },
    {
      id: 'alert-dialog-default-no-media',
      trigger: '[data-gallery-case="alert-dialog-default-no-media-trigger"] button',
      content: '[data-slot="alert-dialog-content"]',
    },
    {
      id: 'alert-dialog-sm-media',
      trigger: '[data-gallery-case="alert-dialog-sm-media-trigger"] button',
      content: '[data-slot="alert-dialog-content"]',
    },
    {
      id: 'alert-dialog-small-actions',
      trigger: '[data-gallery-case="alert-dialog-small-actions-trigger"] button',
      content: '[data-slot="alert-dialog-content"]',
    },
    {
      id: 'alert-dialog-inherited-leading',
      trigger: '[data-gallery-case="alert-dialog-inherited-leading-trigger"] button',
      content: '[data-slot="alert-dialog-content"]',
    },
  ],
}

async function collectOpenDialog(page: Page, id: string): Promise<unknown[]> {
  return page.evaluate(
    ({ id, selector, properties }) => {
      const round = (value: number) => Math.round(value * 100) / 100
      return [...document.querySelectorAll(selector)].map((element) => {
        const rect = element.getBoundingClientRect()
        const computed = getComputedStyle(element)
        const styles: Record<string, string> = {}
        for (const property of properties) {
          styles[property] = computed.getPropertyValue(property)
        }
        return {
          case: id,
          tag: element.tagName.toLowerCase(),
          slot: element.getAttribute('data-slot'),
          size: element.getAttribute('data-size'),
          state: element.getAttribute('data-state'),
          box: {
            width: round(rect.width),
            height: round(rect.height),
            top: round(rect.top),
            left: round(rect.left),
          },
          styles,
        }
      })
    },
    { id, selector: DIALOG_SELECTOR, properties: DIALOG_PROPERTIES }
  )
}

for (const [section, cases] of Object.entries(DIALOG_CASES)) {
  for (const theme of THEMES) {
    test(`computed styles gallery ${section} dialogs ${theme}`, async ({ page }) => {
      await gotoRoute(page, `/__gallery/${section}`, {
        theme,
        waitFor: `[data-gallery-section="${section}"]`,
      })

      const report: unknown[] = []
      for (const dialog of cases) {
        await page.locator(dialog.trigger).first().click()
        await page.locator(dialog.content).first().waitFor({ state: 'visible' })
        await settle(page)
        // The 100ms enter animation is still running when `settle` returns, and
        // a dump taken inside it records a fractional opacity and a scale matrix.
        await waitForAnimationsToFinish(page)
        report.push(...(await collectOpenDialog(page, dialog.id)))
        await page.keyboard.press('Escape')
        await page.locator(dialog.content).first().waitFor({ state: 'detached' })
      }

      await expectTextSnapshot(
        `${JSON.stringify(report, null, 2)}\n`,
        `computed-${section}-dialogs-${theme}.json`
      )
    })
  }
}

/**
 * Popover, tooltip and hover-card content (PR 12).
 *
 * All three are portalled, so they sit outside every `[data-gallery-case]` and
 * are selected on their own. They are also the first elements in this file that
 * only exist while something is open, and each one is dumped with its enter
 * animation seeked past its end, so the resting geometry is what is captured
 * rather than a frame of the `enter` keyframes.
 *
 * `animation-name` is deliberately absent: `stylex.keyframes` hashes the name,
 * which is the one computed value this migration cannot keep
 * (`conventions.md`). The longhands around it are dumped instead, and the
 * frames themselves are pinned by `animations.spec.ts`.
 *
 * `transform-origin` is here because all three contents take it from a Radix
 * custom property that changes with the resolved side, and `box-shadow`
 * because the popover and the hover-card compose `shadow-md` and `ring-1` into
 * one five-slot chain that StyleX has to write out whole.
 */
const FLOATING_PROPERTIES = [
  'display',
  'position',
  'box-sizing',
  'width',
  'height',
  'max-width',
  'min-width',
  'flex-direction',
  'gap',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'font-size',
  'font-weight',
  'line-height',
  'color',
  'background-color',
  'fill',
  'border-radius',
  'box-shadow',
  'outline-style',
  'outline-width',
  'outline-color',
  'opacity',
  'z-index',
  'transform',
  'transform-origin',
  'rotate',
  'translate',
  'animation-duration',
  'animation-timing-function',
  'animation-iteration-count',
  'animation-direction',
  'animation-fill-mode',
  'transition-duration',
]

const FLOATING_SELECTORS = {
  popover: [
    '[data-slot="popover-content"]',
    '[data-slot="popover-header"]',
    '[data-slot="popover-title"]',
    '[data-slot="popover-description"]',
  ].join(', '),
  tooltip: ['[data-slot="tooltip-content"]', '[data-slot="tooltip-content"] svg'].join(', '),
  'hover-card': '[data-slot="hover-card-content"]',
}

/** Opens a floating element and parks its enter animation past its own end. */
async function settleFloating(page: Page, content: string): Promise<void> {
  await page.locator(content).first().waitFor({ state: 'visible' })
  await freezeAnimationsAt(page, 1000)
}

for (const theme of THEMES) {
  test(`computed styles floating ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/floating-extra', {
      theme,
      waitFor: '[data-gallery-section="floating-extra"]',
    })
    await installAnimationFreeze(page)

    await page.locator('[data-gallery-case="popover-side-bottom-trigger"] button').click()
    await settleFloating(page, '[data-slot="popover-content"]')
    await expectTextSnapshot(
      await collectCases(page, FLOATING_SELECTORS.popover, FLOATING_PROPERTIES),
      `computed-floating-popover-${theme}.json`
    )

    await page.locator('[data-gallery-case="tooltip-side-bottom-target"] button').hover()
    await settleFloating(page, '[data-slot="tooltip-content"]')
    await expectTextSnapshot(
      await collectCases(page, FLOATING_SELECTORS.tooltip, FLOATING_PROPERTIES),
      `computed-floating-tooltip-${theme}.json`
    )

    await page.locator('[data-gallery-case="hover-card-rich-trigger"] button').hover()
    await settleFloating(page, '[data-slot="hover-card-content"]')
    await expectTextSnapshot(
      await collectCases(page, FLOATING_SELECTORS['hover-card'], FLOATING_PROPERTIES),
      `computed-floating-hover-card-${theme}.json`
    )
  })
}

/**
 * Menu parts (PR 13).
 *
 * `DropdownMenuContent` and `ContextMenuContent` render into a portal, so they
 * are outside every `[data-gallery-case]` box and the generic `collectCases`
 * collector cannot key on one. This dump keys on the `data-slot` plus the
 * item's own text instead, and adds what a pixel comparison of a menu is worst
 * at proving: the composed `ring-1 + shadow-*` chain, the Radix-driven
 * `transform-origin` and `max-height`, and the animation longhands.
 *
 * `animation-name` is deliberately absent: `stylex.keyframes` hashes the name,
 * so it is the one value the migration is allowed to change
 * (`conventions.md`, "Animations: the name is the one value that changes").
 */
const MENU_PROPERTIES = [
  'display',
  'position',
  'width',
  'min-width',
  'max-height',
  'height',
  'margin',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'gap',
  'align-items',
  'justify-content',
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
  'outline-style',
  'outline-width',
  'outline-color',
  'outline-offset',
  'opacity',
  'z-index',
  'overflow-x',
  'overflow-y',
  'cursor',
  'pointer-events',
  'user-select',
  'right',
  'transform-origin',
  'animation-duration',
  'animation-timing-function',
  'animation-delay',
  'animation-iteration-count',
  'animation-direction',
  'animation-fill-mode',
  'animation-play-state',
  'transition-property',
  'transition-duration',
]

const MENU_SELECTOR = [
  'dropdown-menu-content',
  'dropdown-menu-item',
  'dropdown-menu-checkbox-item',
  'dropdown-menu-checkbox-item-indicator',
  'dropdown-menu-radio-item',
  'dropdown-menu-radio-item-indicator',
  'dropdown-menu-label',
  'dropdown-menu-separator',
  'dropdown-menu-shortcut',
  'dropdown-menu-sub-trigger',
  'dropdown-menu-sub-content',
  'context-menu-content',
  'context-menu-item',
  'context-menu-checkbox-item',
  'context-menu-radio-item',
  'context-menu-label',
  'context-menu-separator',
  'context-menu-shortcut',
  'context-menu-sub-trigger',
  'context-menu-sub-content',
]
  .map((slot) => `[data-slot="${slot}"]`)
  .join(', ')

async function collectMenuParts(page: Page): Promise<string> {
  const report = await page.evaluate(
    ({ selector, properties }) => {
      const round = (value: number) => Math.round(value * 100) / 100
      return [...document.querySelectorAll(selector)].map((element) => {
        const rect = element.getBoundingClientRect()
        const computed = getComputedStyle(element)
        const styles: Record<string, string> = {}
        for (const property of properties) {
          styles[property] = computed.getPropertyValue(property)
        }
        return {
          slot: element.getAttribute('data-slot'),
          label: (element.textContent ?? '').trim().slice(0, 24),
          variant: element.getAttribute('data-variant'),
          inset: element.getAttribute('data-inset'),
          state: element.getAttribute('data-state'),
          side: element.getAttribute('data-side'),
          disabled: element.hasAttribute('data-disabled'),
          highlighted: element.hasAttribute('data-highlighted'),
          box: { width: round(rect.width), height: round(rect.height) },
          styles,
        }
      })
    },
    { selector: MENU_SELECTOR, properties: MENU_PROPERTIES }
  )

  return `${JSON.stringify(report, null, 2)}\n`
}

/** Menus animate on open; the dump is taken at the settled frame. */
async function freezeMenu(page: Page): Promise<void> {
  await freezeAnimationsAt(page, 1_000)
}

for (const theme of THEMES) {
  test(`computed styles dropdown menu ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/menus-extra', {
      theme,
      waitFor: '[data-gallery-section="menus-extra"]',
    })
    await page.locator('[data-gallery-case="menu-dropdown-rich"] button').click()
    await page.locator('[data-slot="dropdown-menu-content"]').waitFor({ state: 'visible' })
    await page.locator('[data-slot="dropdown-menu-sub-trigger"]').hover()
    await page.locator('[data-slot="dropdown-menu-sub-content"]').waitFor({ state: 'visible' })
    await freezeMenu(page)
    await expectTextSnapshot(await collectMenuParts(page), `computed-dropdown-menu-${theme}.json`)
  })

  test(`computed styles dropdown menu inset ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/menus-extra', {
      theme,
      waitFor: '[data-gallery-section="menus-extra"]',
    })
    await page.locator('[data-gallery-case="menu-dropdown-inset"] button').click()
    await page.locator('[data-slot="dropdown-menu-content"]').waitFor({ state: 'visible' })
    await freezeMenu(page)
    await expectTextSnapshot(
      await collectMenuParts(page),
      `computed-dropdown-menu-inset-${theme}.json`
    )
  })

  test(`computed styles context menu ${theme}`, async ({ page }) => {
    await gotoRoute(page, '/__gallery/menus-extra', {
      theme,
      waitFor: '[data-gallery-section="menus-extra"]',
    })
    await page
      .locator('[data-gallery-case="menu-context-rich"] [data-slot="context-menu-trigger"]')
      .click({ button: 'right' })
    await page.locator('[data-slot="context-menu-content"]').waitFor({ state: 'visible' })
    await page.locator('[data-slot="context-menu-sub-trigger"]').hover()
    await page.locator('[data-slot="context-menu-sub-content"]').waitFor({ state: 'visible' })
    await freezeMenu(page)
    await expectTextSnapshot(await collectMenuParts(page), `computed-context-menu-${theme}.json`)
  })
}
