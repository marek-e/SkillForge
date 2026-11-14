import * as React from 'react'
import * as stylex from '@stylexjs/stylex'
import { Avatar as AvatarPrimitive } from 'radix-ui'
import { colors, typography } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'
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
 * The marker classes `group/avatar` and `group/avatar-group` remain selector
 * hooks. They emit no styling of their own.
 */
const IN_AVATAR_SM = ':is(:where(.group\\/avatar)[data-size="sm"] *)'
const IN_AVATAR_DEFAULT = ':is(:where(.group\\/avatar)[data-size="default"] *)'
const IN_AVATAR_LG = ':is(:where(.group\\/avatar)[data-size="lg"] *)'
const IN_GROUP_WITH_LG = ':is(:where(.group\\/avatar-group):has([data-size="lg"]) *)'
const IN_GROUP_WITH_SM = ':is(:where(.group\\/avatar-group):has([data-size="sm"]) *)'
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
    fontSize: {
      default: '0.875rem',
      [IN_AVATAR_SM]: '0.75rem',
      ':is(:where(.group\\/avatar)[data-size="xs"] *)': '8px',
    },
    lineHeight: { default: typography.smLineHeight, [IN_AVATAR_SM]: typography.xsLineHeight },
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
    display: {
      default: 'inline-flex',
    },
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
  badgeChildren: {
    display: {
      default: null,
      ':is(*)>svg': { default: null, [IN_AVATAR_SM]: 'none' },
    },
    // `group-data-[size=sm]/avatar:size-2`,
    // `group-data-[size=default]/avatar:size-2.5`,
    // `group-data-[size=lg]/avatar:size-3`. There is deliberately no `xs` arm:
    // the file has never had one, so an `xs` badge is sized by its content.
    width: {
      default: null,
      ':is(*)>svg': { default: null, [IN_AVATAR_DEFAULT]: '0.5rem', [IN_AVATAR_LG]: '0.5rem' },
    },
    height: {
      default: null,
      ':is(*)>svg': { default: null, [IN_AVATAR_DEFAULT]: '0.5rem', [IN_AVATAR_LG]: '0.5rem' },
    },
  },
  // `flex`
  group: {
    display: 'flex',
  },
  groupChildren: {
    marginInlineStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginInlineEnd: { default: null, ':is(*)>:not(:last-child)': '-0.5rem' },
    boxShadow: { default: null, ':is(*)>[data-slot="avatar"]': RING_2_BACKGROUND },
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
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
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
  groupCountChildren: {
    // `lg` before `sm`, the order Tailwind emits them in, so a group that
    // somehow held both sizes resolves the tie the same way it does today.
    width: {
      default: null,
      ':is(*)>svg': {
        default: '1rem',
        [IN_GROUP_WITH_LG]: '1.25rem',
        [IN_GROUP_WITH_SM]: '0.75rem',
      },
    },
    height: {
      default: null,
      ':is(*)>svg': {
        default: '1rem',
        [IN_GROUP_WITH_LG]: '1.25rem',
        [IN_GROUP_WITH_SM]: '0.75rem',
      },
    },
  },
})
function Avatar({
  className,
  style,
  sx: sxProp,
  size = 'default',
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  sx?: Sx
  size?: 'default' | 'sm' | 'xs' | 'lg'
}) {
  const sx = stylex.props(styles.root, sxProp)
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={['group/avatar', sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}
function AvatarImage({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image> & {
  sx?: Sx
}) {
  const sx = stylex.props(styles.image, sxProp)
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}
function AvatarFallback({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback> & {
  sx?: Sx
}) {
  const sx = stylex.props(styles.fallback, sxProp)
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}
function AvatarBadge({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'span'> & {
  sx?: Sx
}) {
  const sx = stylex.props(styles.badge, sxProp)
  return (
    <span
      data-slot="avatar-badge"
      className={[sx.className, stylex.props(styles.badgeChildren).className, className]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}
function AvatarGroup({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & {
  sx?: Sx
}) {
  const sx = stylex.props(styles.group, sxProp)
  return (
    <div
      data-slot="avatar-group"
      className={[
        'group/avatar-group',
        sx.className,
        stylex.props(styles.groupChildren).className,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}
function AvatarGroupCount({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & {
  sx?: Sx
}) {
  const sx = stylex.props(styles.groupCount, sxProp)
  return (
    <div
      data-slot="avatar-group-count"
      className={[sx.className, stylex.props(styles.groupCountChildren).className, className]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}
export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge }
