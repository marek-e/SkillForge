import type { HTMLAttributes, ReactNode } from 'react'
import * as stylex from '@stylexjs/stylex'
import { ZapIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Case, CaseGroup, CaseRow } from '../Case'

/**
 * StyleX canary (PR 01).
 *
 * The only StyleX-styled code in the tree. It exists to prove, in the visual
 * suite and by hand in dev and production, that:
 *
 * - the unplugin compiles `stylex.create` ahead of the React plugin,
 * - the emitted `@layer priorityN` blocks land between Tailwind's `base` and
 *   `utilities` layers (see the `@layer` statement in `src/index.css`), so a
 *   StyleX rule beats preflight but a caller's Tailwind class still wins,
 * - the selector forms the migration depends on (dark, hover, attribute,
 *   descendant) and dynamic styles survive the dev server, HMR and the
 *   production build.
 *
 * No shipped component imports this file; it is reachable only through the
 * gallery, which is itself gated behind `VITE_VISUAL_GALLERY=true`.
 */
const styles = stylex.create({
  // Every declaration here is also a probe: `padding` and `borderColor` beat
  // Tailwind preflight (`*{padding:0;border:0 solid}`) and the `@layer base`
  // rule in `index.css` (`*{border-color:var(--border)}`) only if the layer
  // order is right.
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingTop: '0.75rem',
    paddingBottom: '0.75rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'var(--primary)',
    borderRadius: 'var(--radius)',
    backgroundColor: 'var(--card)',
    color: 'var(--primary)',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  // `dark:text-primary` -> `:is(.dark *)`
  dark: {
    color: {
      default: 'var(--foreground)',
      ':is(.dark *)': 'var(--primary)',
    },
  },
  // `hover:bg-accent`. Tailwind v4 wraps hover in `@media (hover: hover)`, so
  // the migration uses the same nesting.
  hover: {
    backgroundColor: {
      default: 'var(--card)',
      '@media (hover: hover)': {
        default: 'var(--card)',
        ':hover': 'var(--accent)',
      },
    },
  },
  // `data-[state=open]:*` on the element itself
  attr: {
    backgroundColor: {
      default: 'var(--card)',
      '[data-state="open"]': 'var(--accent)',
    },
    borderStyle: {
      default: 'solid',
      '[data-state="open"]': 'dashed',
    },
  },
  // `[&_svg]:size-8` — a descendant key that styles a child carrying no class
  // of its own. Lucide renders 24x24 by default, so 2rem proves the rule ran.
  descendant: {
    width: {
      default: null,
      ':is(*) svg': '2rem',
    },
    height: {
      default: null,
      ':is(*) svg': '2rem',
    },
    color: {
      default: 'var(--primary)',
      ':is(*) svg': 'var(--destructive)',
    },
  },
})

/** Runtime value as a dynamic style, the form the migration keeps for widths. */
const dynamicStyles = stylex.create({
  width: (value: string) => ({ width: value }),
})

/**
 * Exactly what `stylex.props` accepts. `stylex.StyleXStyles` is too narrow for a
 * style object whose only declarations sit behind an attribute selector: the
 * compiler types those values as `unknown`.
 */
type CanaryStyle = stylex.StyleXArray<
  | (null | undefined | stylex.CompiledStyles)
  | boolean
  | Readonly<[stylex.CompiledStyles, stylex.InlineStyles]>
>

interface CanaryBoxProps extends HTMLAttributes<HTMLDivElement> {
  sx?: CanaryStyle
  children?: ReactNode
}

/**
 * Mirrors the coexistence pattern from `docs/stylex-migration/conventions.md`:
 * StyleX classes first, the caller's `className` last through `cn`, so a
 * Tailwind utility the caller passes still overrides.
 */
function CanaryBox({ sx, className, style, children, ...props }: CanaryBoxProps) {
  const styleProps = stylex.props(styles.base, sx)
  return (
    <div
      data-slot="canary"
      {...props}
      className={cn(styleProps.className, className)}
      style={styleProps.style || style ? { ...styleProps.style, ...style } : undefined}
    >
      {children}
    </div>
  )
}

export function CanarySection() {
  return (
    <div className="space-y-8">
      <CaseGroup title="stylex canary">
        <CaseRow>
          <Case name="canary-base">
            <CanaryBox>base</CanaryBox>
          </Case>
          <Case name="canary-dark">
            <CanaryBox sx={styles.dark}>dark</CanaryBox>
          </Case>
          <Case name="canary-hover">
            <CanaryBox sx={styles.hover}>hover</CanaryBox>
          </Case>
          <Case name="canary-attr">
            <CanaryBox sx={styles.attr} data-state="open">
              attr
            </CanaryBox>
          </Case>
          <Case name="canary-descendant">
            <CanaryBox sx={styles.descendant}>
              <ZapIcon />
              descendant
            </CanaryBox>
          </Case>
          <Case name="canary-override">
            <CanaryBox className="p-8 bg-destructive">override</CanaryBox>
          </Case>
          <Case name="canary-dynamic">
            <CanaryBox sx={dynamicStyles.width('220px')}>dynamic</CanaryBox>
          </Case>
        </CaseRow>
      </CaseGroup>
    </div>
  )
}
