import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Drawer as DrawerPrimitive } from 'vaul'

import { colors, radius, typography } from '@/styles/tokens.stylex'

/** The `shadcn/tailwind.css` custom variants, verbatim; see `sheet.tsx`. */
const OPEN = ':is(:where([data-state="open"]), :where([data-open]:not([data-open="false"])))'
const CLOSED =
  ':is(:where([data-state="closed"]), :where([data-closed]:not([data-closed="false"])))'

/**
 * The overlay's `data-open:animate-in` / `data-closed:animate-out` pair, with
 * the `--tw-enter-*` /
 * `--tw-exit-*` custom properties already substituted; see `sheet.tsx` for the
 * full derivation. Only the fade is used here, so the transform and filter
 * frames are the untouched defaults.
 *
 * `DrawerContent` itself has no animation utility at all: vaul drives it with
 * an inline transform, which stays exactly where it is.
 */
const FADE_FROM = {
  opacity: 0,
  transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotate(0)',
  filter: 'blur(0)',
} as const

const overlayEnter = stylex.keyframes({ from: FADE_FROM })
const overlayExit = stylex.keyframes({ to: FADE_FROM })

/** vaul writes this on the content element; the `direction` prop sits on the root. */
const BOTTOM = '[data-vaul-drawer-direction="bottom"]'
const TOP = '[data-vaul-drawer-direction="top"]'
const LEFT = '[data-vaul-drawer-direction="left"]'
const RIGHT = '[data-vaul-drawer-direction="right"]'

/**
 * `group-data-[vaul-drawer-direction=…]/drawer-content:` — a descendant reading
 * the marker class on the content element. Tailwind wraps the group class in
 * `:where()`, so the whole compound weighs (0,2,0); `:is(:where(.group\/…)[…] *)`
 * reproduces both the match and the weight.
 */
const IN_BOTTOM = ':is(:where(.group\\/drawer-content)[data-vaul-drawer-direction="bottom"] *)'
const IN_TOP = ':is(:where(.group\\/drawer-content)[data-vaul-drawer-direction="top"] *)'

const styles = stylex.create({
  // `bg-black/10 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 z-50
  //  data-open:animate-in data-closed:animate-out data-closed:fade-out-0
  //  data-open:fade-in-0`
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    // Tailwind emits a `#0000001a` fallback and overrides it with a
    // `color-mix()` inside an `@supports` block that every Chromium satisfies.
    // `#000` rather than `var(--color-black)`: that Tailwind custom property
    // disappears in PR 32.
    backgroundColor: 'color-mix(in oklab, #000 10%, transparent)',
    // The `supports-backdrop-filter:backdrop-blur-xs` blur, resolved:
    // `blur(var(--blur-xs))` is `blur(4px)`. The `@supports` guard is a no-op —
    // a browser without the property drops the declaration anyway.
    backdropFilter: 'blur(4px)',
    animationName: { default: null, [OPEN]: overlayEnter, [CLOSED]: overlayExit },
    // No duration utility here, so the composed value keeps tw-animate-css's
    // own `0.15s` / `ease` defaults. Delay, iteration count, direction and
    // fill-mode are initial values on both sides.
    animationDuration: '150ms',
    animationTimingFunction: 'ease',
  },

  // `bg-background flex h-auto flex-col fixed z-50`, then one block of
  // per-direction rules. These have to stay attribute selectors rather than
  // become prop-selected style objects: `direction` is a prop of `Drawer`, and
  // vaul is what puts `data-vaul-drawer-direction` on this element.
  content: {
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    position: 'fixed',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    height: 'auto',
    backgroundColor: colors.background,

    // `inset-x-0` / `inset-y-0`
    insetInline: { default: null, [BOTTOM]: 0, [TOP]: 0 },
    insetBlock: { default: null, [LEFT]: 0, [RIGHT]: 0 },
    // `bottom-0` / `top-0` / `left-0` / `right-0`
    bottom: { default: null, [BOTTOM]: 0 },
    top: { default: null, [TOP]: 0 },
    left: { default: null, [LEFT]: 0 },
    right: { default: null, [RIGHT]: 0 },

    // `data-[vaul-drawer-direction=bottom]:mt-24` /
    // `data-[vaul-drawer-direction=top]:mb-24`
    marginTop: { default: null, [BOTTOM]: '6rem' },
    marginBottom: { default: null, [TOP]: '6rem' },
    // `data-[vaul-drawer-direction=bottom]:max-h-[80vh]` and the `top` one
    maxHeight: { default: null, [BOTTOM]: '80vh', [TOP]: '80vh' },
    // `data-[vaul-drawer-direction=left]:w-3/4` and the `right` one. The bare
    // utility names stay out of these comments: Tailwind's scanner reads them,
    // and only the prefixed forms ever existed in the bundle.
    width: { default: null, [LEFT]: '75%', [RIGHT]: '75%' },
    // `sm:max-w-sm`, nested under the direction so the two conditions apply
    // together the way the stacked Tailwind variants do.
    maxWidth: {
      default: null,
      [LEFT]: { default: null, '@media (width >= 40rem)': '24rem' },
      [RIGHT]: { default: null, '@media (width >= 40rem)': '24rem' },
    },

    // `data-[vaul-drawer-direction=bottom]:rounded-t-xl`,
    // `data-[vaul-drawer-direction=left]:rounded-r-xl`,
    // `data-[vaul-drawer-direction=right]:rounded-l-xl`,
    // `data-[vaul-drawer-direction=top]:rounded-b-xl`
    borderTopLeftRadius: { default: null, [BOTTOM]: radius.xl, [RIGHT]: radius.xl },
    borderTopRightRadius: { default: null, [BOTTOM]: radius.xl, [LEFT]: radius.xl },
    borderBottomRightRadius: { default: null, [TOP]: radius.xl, [LEFT]: radius.xl },
    borderBottomLeftRadius: { default: null, [TOP]: radius.xl, [RIGHT]: radius.xl },

    // `data-[vaul-drawer-direction=bottom]:border-t`,
    // `data-[vaul-drawer-direction=left]:border-r`,
    // `data-[vaul-drawer-direction=right]:border-l`,
    // `data-[vaul-drawer-direction=top]:border-b`: width and style only,
    // the colour keeps coming from the `@layer base` `*` rule.
    borderTopStyle: { default: null, [BOTTOM]: 'solid' },
    borderTopWidth: { default: null, [BOTTOM]: '1px' },
    borderRightStyle: { default: null, [LEFT]: 'solid' },
    borderRightWidth: { default: null, [LEFT]: '1px' },
    borderLeftStyle: { default: null, [RIGHT]: 'solid' },
    borderLeftWidth: { default: null, [RIGHT]: '1px' },
    borderBottomStyle: { default: null, [TOP]: 'solid' },
    borderBottomWidth: { default: null, [TOP]: '1px' },
  },

  // `bg-muted mt-4 h-1 w-[100px] rounded-full mx-auto hidden shrink-0
  //  group-data-[vaul-drawer-direction=bottom]/drawer-content:block`
  handle: {
    backgroundColor: colors.muted,
    marginTop: '1rem',
    height: '0.25rem',
    width: '100px',
    borderRadius: 'calc(infinity * 1px)',
    marginInline: 'auto',
    flexShrink: 0,
    display: { default: 'none', [IN_BOTTOM]: 'block' },
  },

  // `gap-0.5 p-4 flex flex-col md:gap-0.5` plus the two centring rules.
  header: {
    display: 'flex',
    flexDirection: 'column',
    // `md:gap-0.5` repeats `gap-0.5`, so one declaration says the same thing.
    gap: '0.125rem',
    padding: '1rem',
    // `md:text-left` is (0,1,0) and the two group rules are (0,2,0), so above
    // 48rem the centring still wins. StyleX ranks a media query *above* an
    // `:is()`, so the combination is written out explicitly to settle it —
    // the trick the conventions prescribe for a same-property tie.
    textAlign: {
      default: null,
      '@media (width >= 48rem)': 'left',
      [IN_BOTTOM]: { default: 'center', '@media (width >= 48rem)': 'center' },
      [IN_TOP]: { default: 'center', '@media (width >= 48rem)': 'center' },
    },
  },

  // `gap-2 p-4 mt-auto flex flex-col`
  footer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1rem',
    marginTop: 'auto',
  },

  // `text-foreground text-base font-medium`
  title: {
    color: colors.foreground,
    fontSize: '1rem',
    // `calc(1.5 / 1)` folds to exactly `1.5`, so the ratio is kept as a number
    // rather than rewritten as `1.5rem`; see `sheet.tsx`.
    lineHeight: 1.5,
    fontWeight: 500,
  },

  // `text-muted-foreground text-sm`
  description: {
    color: colors.mutedForeground,
    // The paired line-height as the length it resolves to; see `sheet.tsx`.
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
})

const CONTENT_CLASSES = 'group/drawer-content'

function Drawer({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  style,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  const sx = stylex.props(styles.overlay)

  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  style,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  const sx = stylex.props(styles.content)
  const handle = stylex.props(styles.handle)

  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={[CONTENT_CLASSES, sx.className, className].filter(Boolean).join(' ')}
        style={sx.style || style ? { ...sx.style, ...style } : undefined}
        {...props}
      >
        <div className={handle.className} style={handle.style} />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.header)

  return (
    <div
      data-slot="drawer-header"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function DrawerFooter({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.footer)

  return (
    <div
      data-slot="drawer-footer"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  style,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  const sx = stylex.props(styles.title)

  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  style,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  const sx = stylex.props(styles.description)

  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
