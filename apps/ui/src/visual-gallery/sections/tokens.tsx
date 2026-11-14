import * as stylex from '@stylexjs/stylex'
import { colors, fonts, motion, radius } from '@/styles/tokens.stylex'
import { Case, CaseGroup, CaseRow } from '../Case'

/**
 * Theme tokens and native element defaults (PR 02).
 *
 * Two jobs:
 *
 * 1. Freeze the palette. Every entry of `colors` is rendered twice — as a
 *    filled swatch and as a text sample — so a changed `oklch()` literal, a
 *    broken `var()` alias or a `.dark` block that stopped switching shows up as
 *    a pixel difference in light *and* dark. The radius scale and the three
 *    font stacks get the same treatment.
 * 2. Freeze the base layer. `native-defaults` renders bare HTML elements with
 *    no class of any kind, so everything they show comes from Tailwind
 *    preflight plus the project's own `@layer base` rules. That is the case
 *    `computed-styles.spec.ts` dumps property by property, which is what proves
 *    rewriting those rules without `@apply` changed nothing.
 *
 * Every style here goes through the token module, so the section is also the
 * first consumer of `src/styles/tokens.stylex.ts`.
 */
const styles = stylex.create({
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  swatch: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    width: '9rem',
  },
  chip: {
    height: '2.5rem',
    borderRadius: radius.md,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: '0.625rem',
    lineHeight: '1rem',
    color: colors.mutedForeground,
  },
  sample: {
    fontFamily: fonts.sans,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  radiusBox: {
    width: '4rem',
    height: '4rem',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  fontSample: {
    fontSize: '1.125rem',
    lineHeight: '1.75rem',
    color: colors.foreground,
  },
  // Holds the bare `<select>` of `native-defaults` outside the flow and
  // unpainted; see the comment at its use site.
  nativeProbe: {
    position: 'absolute',
    visibility: 'hidden',
  },
  // Tailwind's `transition` defaults, which no state in the gallery triggers:
  // the declarations are here so their computed values can be snapshotted.
  motionBox: {
    width: '9rem',
    height: '2.5rem',
    borderRadius: radius.lg,
    backgroundColor: colors.secondary,
    color: colors.secondaryForeground,
    transitionProperty: 'background-color',
    transitionDuration: motion.duration,
    transitionTimingFunction: motion.ease,
  },
})

/** Runtime token values as dynamic styles, so one pair of rules covers all 32. */
const dynamic = stylex.create({
  background: (value: string) => ({ backgroundColor: value }),
  foreground: (value: string) => ({ color: value }),
  radius: (value: string) => ({ borderRadius: value }),
  fontFamily: (value: string) => ({ fontFamily: value }),
})

/** Kept in the declaration order of `colors` in `src/styles/tokens.stylex.ts`. */
const COLOR_TOKENS: readonly (readonly [string, string])[] = [
  ['background', colors.background],
  ['foreground', colors.foreground],
  ['card', colors.card],
  ['cardForeground', colors.cardForeground],
  ['popover', colors.popover],
  ['popoverForeground', colors.popoverForeground],
  ['primary', colors.primary],
  ['primaryForeground', colors.primaryForeground],
  ['secondary', colors.secondary],
  ['secondaryForeground', colors.secondaryForeground],
  ['muted', colors.muted],
  ['mutedForeground', colors.mutedForeground],
  ['accent', colors.accent],
  ['accentForeground', colors.accentForeground],
  ['destructive', colors.destructive],
  ['border', colors.border],
  ['input', colors.input],
  ['ring', colors.ring],
  ['chart1', colors.chart1],
  ['chart2', colors.chart2],
  ['chart3', colors.chart3],
  ['chart4', colors.chart4],
  ['chart5', colors.chart5],
  ['sidebar', colors.sidebar],
  ['sidebarForeground', colors.sidebarForeground],
  ['sidebarPrimary', colors.sidebarPrimary],
  ['sidebarPrimaryForeground', colors.sidebarPrimaryForeground],
  ['sidebarAccent', colors.sidebarAccent],
  ['sidebarAccentForeground', colors.sidebarAccentForeground],
  ['sidebarBorder', colors.sidebarBorder],
  ['sidebarRing', colors.sidebarRing],
  ['toasterBackground', colors.toasterBackground],
]

const RADIUS_TOKENS: readonly (readonly [string, string])[] = [
  ['base', radius.base],
  ['sm', radius.sm],
  ['md', radius.md],
  ['lg', radius.lg],
  ['xl', radius.xl],
  ['2xl', radius['2xl']],
  ['3xl', radius['3xl']],
  ['4xl', radius['4xl']],
]

const FONT_TOKENS: readonly (readonly [string, string])[] = [
  ['sans', fonts.sans],
  ['serif', fonts.serif],
  ['mono', fonts.mono],
]

export function TokensSection() {
  return (
    <div {...stylex.props(galleryStyles.case0)}>
      <CaseGroup title="colour tokens">
        <CaseRow>
          <Case name="tokens-colors">
            <div {...stylex.props(styles.grid)}>
              {COLOR_TOKENS.map(([name, value]) => (
                <div key={name} {...stylex.props(styles.swatch)}>
                  <div
                    data-token-fill={name}
                    {...stylex.props(styles.chip, dynamic.background(value))}
                  />
                  <span {...stylex.props(styles.label)}>{name}</span>
                  <span
                    data-token-text={name}
                    {...stylex.props(styles.sample, dynamic.foreground(value))}
                  >
                    Aa 0123
                  </span>
                </div>
              ))}
            </div>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="radius scale">
        <CaseRow>
          <Case name="tokens-radius">
            <div {...stylex.props(styles.grid)}>
              {RADIUS_TOKENS.map(([name, value]) => (
                <div key={name} {...stylex.props(styles.swatch)}>
                  <div
                    data-radius={name}
                    {...stylex.props(styles.radiusBox, dynamic.radius(value))}
                  />
                  <span {...stylex.props(styles.label)}>{name}</span>
                </div>
              ))}
            </div>
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="font stacks">
        <CaseRow>
          <Case name="tokens-fonts">
            <div {...stylex.props(styles.grid)}>
              {FONT_TOKENS.map(([name, value]) => (
                <div key={name} {...stylex.props(styles.swatch)}>
                  <span {...stylex.props(styles.label)}>{name}</span>
                  <span
                    data-font={name}
                    {...stylex.props(styles.fontSample, dynamic.fontFamily(value))}
                  >
                    Sphinx 0123
                  </span>
                </div>
              ))}
            </div>
          </Case>
          <Case name="tokens-motion">
            <div data-motion="default" {...stylex.props(styles.motionBox)} />
          </Case>
        </CaseRow>
      </CaseGroup>

      <CaseGroup title="native element defaults">
        <CaseRow>
          {/* No class, no data-slot, no inline style: everything these elements
              render comes from preflight and the project's `@layer base`. */}
          <Case name="native-defaults">
            <div>
              <div>div</div>
              <button type="button">button</button>
              <input defaultValue="input" />
              <textarea defaultValue="textarea" />
              {/* The bare <select> stays a descendant of this case, because
                  `computed-styles.spec.ts` reads it at
                  `[data-gallery-case="native-defaults"] select` and its entry
                  must keep the same values. It is taken out of the flow and
                  left unpainted because Chromium rasterises its OS-drawn arrow
                  one or two pixels differently between runs of
                  `vite build && vite preview`, which made `gallery tokens
                  light` flaky (recorded in pr-04.md). The wrapper sets no
                  inherited property and the probe tracks nothing that depends
                  on layout or paint, so the select's own computed values are
                  unchanged. */}
              <div {...stylex.props(styles.nativeProbe)}>
                <select defaultValue="one">
                  <option value="one">one</option>
                  <option value="two">two</option>
                </select>
              </div>
              <a href="#native-defaults">anchor</a>
              <hr />
              <h1>h1</h1>
              <p>p</p>
            </div>
          </Case>
        </CaseRow>
      </CaseGroup>
    </div>
  )
}

const galleryStyles = stylex.create({
  case0: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '2rem' },
  },
})
