import * as stylex from '@stylexjs/stylex'
import { sileo, Toaster as SileoToaster } from 'sileo'

import { cn } from '@/lib/utils'
import { colors } from '@/styles/tokens.stylex'

/**
 * `text-md`, kept as a literal class because there is nothing to translate:
 * Tailwind has no `md` step on its font-size scale and the project does not add
 * one, so the class matches no rule and never has. Removing it would be a
 * change to the rendered `class` attribute for no reason; it goes with the rest
 * of the bridge in PR 32.
 */
const TITLE_NO_OP_CLASS = 'text-md'

/**
 * Sileo injects its own stylesheet into `<head>` at import time, **unlayered**,
 * so `[data-sileo-title]` and `[data-sileo-description]` outrank every layered
 * rule — a Tailwind utility in `@layer utilities` just as much as a StyleX class
 * in `priorityN`. Measured on the toast these classes land on:
 *
 * | Declaration                         | What actually applies                                  |
 * | ----------------------------------- | ------------------------------------------------------ |
 * | title `font-medium`                 | Sileo's own `font-weight: 500` — the same value         |
 * | title `text-white` / `text-black`   | Sileo's `color: var(--sileo-tone)`, per toast state     |
 * | description `text-sm`               | Sileo's own `0.875rem`/`1.25rem` — the same values      |
 * | description `text-white`/`-black`   | **this file**; Sileo sets no colour on the description  |
 *
 * Only the description's colour is live, and it stays live for the same reason
 * it was before. The other three are written out anyway, because the migration
 * moves the declaration, not the outcome — and because the day Sileo stops
 * declaring them, this file has to keep declaring what it declares today.
 */
const styles = stylex.create({
  // `font-medium dark:text-black text-white`
  title: {
    fontWeight: 500,
    color: { default: '#fff', ':is(.dark *)': '#000' },
  },

  // `text-sm dark:text-black text-white`; the paired line-height as the length
  // it resolves to
  description: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: { default: '#fff', ':is(.dark *)': '#000' },
  },
})

const Toaster = () => {
  const title = stylex.props(styles.title)
  const description = stylex.props(styles.description)

  return (
    <SileoToaster
      position="top-right"
      options={{
        styles: {
          description: description.className,
          title: cn(TITLE_NO_OP_CLASS, title.className),
        },
        // `var(--toaster-background)`, now through the token module. Sileo puts
        // this on the SVG `fill` *presentation attribute* of the two rects it
        // draws the toast from, where a `var()` reference does resolve.
        fill: colors.toasterBackground,
      }}
    />
  )
}

const toast = sileo

export { Toaster, toast }
