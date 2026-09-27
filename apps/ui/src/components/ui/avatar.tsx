import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Avatar as AvatarPrimitive } from 'radix-ui'

import { colors } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'

/**
 * `rounded-full`, whose value is `calc(infinity * 1px)`
 * (`tailwind-values.md` §5). lightningcss folds it to the same
 * `3.40282e38px` the Tailwind asset already ships.
 */
const ROUNDED_FULL = 'calc(infinity * 1px)'

/**
 * `ring-2 ring-background`, as the five-layer `box-shadow` chain a ring utility
 * composes (`tailwind-values.md` §5). Tailwind never writes `box-shadow`
 * directly: it sets `--tw-ring-shadow` and re-declares the chain, filling every
 * layer no utility set with `0 0 #0000`. `--tw-ring-offset-width` stays at its
 * registered `0px`, so `calc(2px + 0px)` is written as the `2px` it computes to.
 */
const RING_2_BACKGROUND = '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 2px var(--background), 0 0 #0000'

/**
 * `group-data-[size=…]/avatar:` and `group-has-data-[size=…]/avatar-group:`,
 * read off the built CSS: Tailwind wraps the group class in `:where()`, so the
 * selector is `:is(:where(.group\/avatar)[data-size=sm] *)` and the class
 * contributes no specificity of its own.
 *
 * The marker classes `group/avatar` and `group/avatar-group` therefore stay on
 * the two roots below. They emit no rules themselves, and the `[&>svg]` classes
 * that still have to be Tailwind (`BADGE_ICON_CLASSES`, `GROUP_COUNT_ICON_CLASSES`)
 * are written against them.
 */
const IN_AVATAR_SM = ':is(:where(.group\\/avatar)[data-size="sm"] *)'
const IN_AVATAR_DEFAULT = ':is(:where(.group\\/avatar)[data-size="default"] *)'
const IN_AVATAR_LG = ':is(:where(.group\\/avatar)[data-size="lg"] *)'
const IN_GROUP_WITH_LG = ':is(:where(.group\\/avatar-group):has([data-size="lg"]) *)'
const IN_GROUP_WITH_SM = ':is(:where(.group\\/avatar-group):has([data-size="sm"]) *)'

/**
 * The icon rules of `AvatarBadge` and `AvatarGroupCount`, kept as Tailwind
 * classes: each one styles an `svg` the component does not own, and a StyleX
 * rule in a `priorityN` layer cannot beat a `size-*` utility a caller puts on
 * that icon. Removed with the rest of the bridge in PR 32.
 *
 * `AvatarBadge`'s own `group-data-[size=…]/avatar:size-*` rules style the badge
 * itself and did migrate; only the `[&>svg]` halves are left here, which is why
 * the two lists read as one class string split in half.
 */
const BADGE_ICON_CLASSES =
  'group-data-[size=sm]/avatar:[&>svg]:hidden group-data-[size=default]/avatar:[&>svg]:size-2 group-data-[size=lg]/avatar:[&>svg]:size-2'
const GROUP_COUNT_ICON_CLASSES =
  '[&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3'

/**
 * `text-sm` on `AvatarFallback` and `AvatarGroupCount`, and the two variants
 * that reduce it. They stay Tailwind for the paired-line-height reason in
 * `conventions.md`: `text-sm`'s line height is the ratio `calc(1.25 / 0.875)`,
 * and `group-data-[size=xs]/avatar:text-[8px]` compiles to a bare
 * `font-size: 8px` with **no** line-height declaration at all, so at `xs` the
 * ratio re-resolves against 8px. A StyleX `lineHeight: '1.25rem'` is a length
 * and would keep a 20px line box at every size. Removed in PR 32.
 */
const FALLBACK_TEXT_CLASSES =
  'text-sm group-data-[size=sm]/avatar:text-xs group-data-[size=xs]/avatar:text-[8px]'
const GROUP_COUNT_TEXT_CLASS = 'text-sm'

/**
 * `-space-x-2` and `*:data-[slot=avatar]:ring-background`
 * `*:data-[slot=avatar]:ring-2` on `AvatarGroup`. All three reach out to the
 * group's children — `-space-x-2` compiles to
 * `:where(.-space-x-2 > :not(:last-child))` and the two ring utilities to
 * `:is(.…>*)[data-slot=avatar]` — so they keep the specificity advantage they
 * have today by staying Tailwind. Removed in PR 32.
 */
const GROUP_CHILD_CLASSES =
  '*:data-[slot=avatar]:ring-background -space-x-2 *:data-[slot=avatar]:ring-2'

const styles = stylex.create({
  // `size-8 rounded-full after:rounded-full data-[size=lg]:size-10
  //  data-[size=sm]:size-6 data-[size=xs]:size-4 after:border-border relative
  //  flex shrink-0 select-none after:absolute after:inset-0 after:border
  //  after:mix-blend-darken dark:after:mix-blend-lighten`
  root: {
    position: 'relative',
    display: 'flex',
    flexShrink: 0,
    userSelect: 'none',
    // `size-8`, with one `data-[size=…]` override per named size. An arbitrary
    // data variant is a plain attribute selector on the element itself.
    width: {
      default: '2rem',
      '[data-size="lg"]': '2.5rem',
      '[data-size="sm"]': '1.5rem',
      '[data-size="xs"]': '1rem',
    },
    height: {
      default: '2rem',
      '[data-size="lg"]': '2.5rem',
      '[data-size="sm"]': '1.5rem',
      '[data-size="xs"]': '1rem',
    },
    borderRadius: ROUNDED_FULL,
    '::after': {
      // Every `after:*` utility writes `content: var(--tw-content)`, and
      // `--tw-content` is registered with an initial value of `""`, so the
      // pseudo-element always exists.
      content: '""',
      position: 'absolute',
      inset: '0rem',
      borderRadius: ROUNDED_FULL,
      borderWidth: '1px',
      // `after:border` writes `border-style: var(--tw-border-style)`, whose
      // registered initial value is `solid`.
      borderStyle: 'solid',
      borderColor: colors.border,
      mixBlendMode: { default: 'darken', ':is(.dark *)': 'lighten' },
    },
  },

  // `rounded-full aspect-square size-full object-cover`
  image: {
    borderRadius: ROUNDED_FULL,
    aspectRatio: '1 / 1',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  // `bg-muted text-muted-foreground rounded-full flex size-full items-center
  //  justify-center`
  fallback: {
    backgroundColor: colors.muted,
    color: colors.mutedForeground,
    borderRadius: ROUNDED_FULL,
    display: 'flex',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // `bg-primary text-primary-foreground ring-background absolute right-0
  //  bottom-0 z-10 inline-flex items-center justify-center rounded-full
  //  bg-blend-color ring-2 select-none` plus the per-size `size-*` rules
  badge: {
    position: 'absolute',
    right: '0rem',
    bottom: '0rem',
    zIndex: 10,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    backgroundColor: colors.primary,
    backgroundBlendMode: 'color',
    color: colors.primaryForeground,
    borderRadius: ROUNDED_FULL,
    boxShadow: RING_2_BACKGROUND,
    // `group-data-[size=sm]/avatar:size-2`,
    // `group-data-[size=default]/avatar:size-2.5`,
    // `group-data-[size=lg]/avatar:size-3`. There is deliberately no `xs` arm:
    // the file has never had one, so an `xs` badge is sized by its content.
    width: {
      default: null,
      [IN_AVATAR_SM]: '0.5rem',
      [IN_AVATAR_DEFAULT]: '0.625rem',
      [IN_AVATAR_LG]: '0.75rem',
    },
    height: {
      default: null,
      [IN_AVATAR_SM]: '0.5rem',
      [IN_AVATAR_DEFAULT]: '0.625rem',
      [IN_AVATAR_LG]: '0.75rem',
    },
  },

  // `flex`
  group: {
    display: 'flex',
  },

  // `bg-muted text-muted-foreground size-8 rounded-full ring-background
  //  relative flex shrink-0 items-center justify-center ring-2` plus
  //  `group-has-data-[size=lg]/avatar-group:size-10` and
  //  `group-has-data-[size=sm]/avatar-group:size-6`
  groupCount: {
    position: 'relative',
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.muted,
    color: colors.mutedForeground,
    borderRadius: ROUNDED_FULL,
    boxShadow: RING_2_BACKGROUND,
    // `lg` before `sm`, the order Tailwind emits them in, so a group that
    // somehow held both sizes resolves the tie the same way it does today.
    width: {
      default: '2rem',
      [IN_GROUP_WITH_LG]: '2.5rem',
      [IN_GROUP_WITH_SM]: '1.5rem',
    },
    height: {
      default: '2rem',
      [IN_GROUP_WITH_LG]: '2.5rem',
      [IN_GROUP_WITH_SM]: '1.5rem',
    },
  },
})

function Avatar({
  className,
  style,
  size = 'default',
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: 'default' | 'sm' | 'xs' | 'lg'
}) {
  const sx = stylex.props(styles.root)

  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn('group/avatar', sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  style,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  const sx = stylex.props(styles.image)

  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  style,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  const sx = stylex.props(styles.fallback)

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(FALLBACK_TEXT_CLASSES, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AvatarBadge({ className, style, ...props }: React.ComponentProps<'span'>) {
  const sx = stylex.props(styles.badge)

  return (
    <span
      data-slot="avatar-badge"
      className={cn(BADGE_ICON_CLASSES, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AvatarGroup({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.group)

  return (
    <div
      data-slot="avatar-group"
      className={cn('group/avatar-group', GROUP_CHILD_CLASSES, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function AvatarGroupCount({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.groupCount)

  return (
    <div
      data-slot="avatar-group-count"
      className={cn(GROUP_COUNT_TEXT_CLASS, GROUP_COUNT_ICON_CLASSES, sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge }
