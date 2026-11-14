import { Collapsible as CollapsiblePrimitive } from 'radix-ui'

/**
 * Audited for PR 09 and left as it is: none of the three parts carries any
 * styling. Each one adds a `data-slot` and forwards everything else to Radix,
 * which writes the `data-state` attribute the caller's own classes react to
 * (`disclosure-extra`'s two bordered cases show a body styled entirely from the
 * call site). There is no Tailwind here to move, and adding a StyleX class
 * would be a DOM change rather than a migration.
 *
 * The one thing this file could have owned — the pair of collapsible height
 * keyframes `tw-animate-css` ships — is not used by it: no part applies the
 * utility that would fire them, so the content simply appears and disappears.
 * (Their names are deliberately not spelled out: Tailwind's scanner reads this
 * file, and naming them would make the build emit two rules and a `@keyframes`
 * block nothing renders.)
 */
function Collapsible({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return <CollapsiblePrimitive.CollapsibleTrigger data-slot="collapsible-trigger" {...props} />
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return <CollapsiblePrimitive.CollapsibleContent data-slot="collapsible-content" {...props} />
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
