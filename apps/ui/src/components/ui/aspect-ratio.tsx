import { AspectRatio as AspectRatioPrimitive } from 'radix-ui'

/**
 * Audited for PR 07 and left as it is: this component has no styling of its
 * own. It renders Radix's `AspectRatio.Root`, which sizes itself with two
 * inline styles it computes from `ratio` (a wrapper with `padding-bottom` and
 * an absolutely positioned child), and it accepts no `className` from this
 * file. There is nothing Tailwind here to move, and adding a StyleX class would
 * be a DOM change rather than a migration.
 */
function AspectRatio({ ...props }: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }
