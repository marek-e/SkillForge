import { useMemo } from 'react'
import * as stylex from '@stylexjs/stylex'
import { cva, type VariantProps } from 'class-variance-authority'

import { colors, radius } from '@/styles/tokens.stylex'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

/**
 * `has-data-checked:`, spelled out.
 *
 * `data-checked` is one of the custom variants `shadcn/tailwind.css` adds, not
 * Tailwind's generic attribute syntax, so the compiled selector matches either
 * Radix's `data-state` or a bare `data-checked` that is not `"false"`. Copied
 * from the built CSS rather than from the class name.
 */
const HAS_CHECKED =
  ':has(:where([data-state="checked"]), :where([data-checked]:not([data-checked="false"])))'

/** `group-data-[disabled=true]/field:` — an ancestor `Field` marked disabled. */
const IN_DISABLED_FIELD = ':is(.group\\/field[data-disabled="true"] *)'

/**
 * `@md/field-group:` — the `28rem` container query of the `FieldGroup` this
 * field sits in. The container is named by `containerName` on `FieldGroup`
 * below, so the query is on the container, not on the viewport.
 */
const AT_MD_FIELD_GROUP = '@container field-group (min-width: 28rem)'

const styles = stylex.create({
  // `gap-4 has-[>[data-slot=checkbox-group]]:gap-3
  //  has-[>[data-slot=radio-group]]:gap-3 flex flex-col`
  fieldSet: {
    display: 'flex',
    flexDirection: 'column',
    gap: {
      default: '1rem',
      ':has(>[data-slot="checkbox-group"])': '0.75rem',
      ':has(>[data-slot="radio-group"])': '0.75rem',
    },
  },

  // `mb-1.5 font-medium`
  fieldLegend: {
    marginBottom: '0.375rem',
    fontWeight: 500,
  },
  // `data-[variant=legend]:text-base`
  fieldLegendLegend: {
    fontSize: '1rem',
    lineHeight: '1.5rem',
  },
  // `data-[variant=label]:text-sm`
  fieldLegendLabel: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },

  // `gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4
  //  @container/field-group flex w-full flex-col`
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    // `@container/field-group`
    containerType: 'inline-size',
    containerName: 'field-group',
    gap: {
      default: '1.25rem',
      // `data-[slot=checkbox-group]:gap-3`. This element's own `data-slot` is
      // always `field-group`, so the rule can never match. Kept because the
      // migration copies the cascade, dead rules included.
      '[data-slot="checkbox-group"]': '0.75rem',
      // `*:data-[slot=field-group]:gap-4` — a nested `FieldGroup`, which this
      // file owns, so the rule can be a StyleX descendant selector. It keeps
      // its advantage over the child's own gap because a conditional StyleX
      // rule is emitted after an unconditional one for the same property.
      ':is(*)>[data-slot="field-group"]': '1rem',
    },
  },

  // `data-[invalid=true]:text-destructive gap-2 flex w-full`
  field: {
    display: 'flex',
    width: '100%',
    gap: '0.5rem',
    color: {
      default: null,
      '[data-invalid="true"]': colors.destructive,
    },
  },
  // `flex-col` (the two child rules of this variant stay Tailwind)
  fieldVertical: {
    flexDirection: 'column',
  },
  // `flex-row items-center has-[>[data-slot=field-content]]:items-start
  //  *:data-[slot=field-label]:flex-auto`
  fieldHorizontal: {
    flexDirection: 'row',
    alignItems: {
      default: 'center',
      ':has(>[data-slot="field-content"])': 'flex-start',
    },
    // Targets `FieldLabel`/`FieldTitle`, which this file owns.
    flex: {
      default: null,
      ':is(*)>[data-slot="field-label"]': 'auto',
    },
  },
  // `flex-col` plus the `@md/field-group:` half of the responsive variant
  fieldResponsive: {
    flexDirection: {
      default: 'column',
      [AT_MD_FIELD_GROUP]: 'row',
    },
    alignItems: {
      default: null,
      [AT_MD_FIELD_GROUP]: {
        default: 'center',
        ':has(>[data-slot="field-content"])': 'flex-start',
      },
    },
    flex: {
      default: null,
      [AT_MD_FIELD_GROUP]: {
        default: null,
        ':is(*)>[data-slot="field-label"]': 'auto',
      },
    },
  },

  // `gap-0.5 flex flex-1 flex-col leading-snug`
  fieldContent: {
    display: 'flex',
    flex: '1 1 0%',
    flexDirection: 'column',
    gap: '0.125rem',
    lineHeight: 1.375,
  },

  // `has-data-checked:bg-primary/5 has-data-checked:border-primary/30
  //  dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10
  //  gap-2 group-data-[disabled=true]/field:opacity-50
  //  has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border
  //  *:data-[slot=field]:p-2.5 flex w-fit
  //  has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col`
  fieldLabel: {
    display: 'flex',
    gap: '0.5rem',
    width: {
      default: 'fit-content',
      ':has(>[data-slot="field"])': '100%',
    },
    flexDirection: {
      default: null,
      ':has(>[data-slot="field"])': 'column',
    },
    borderRadius: {
      default: null,
      ':has(>[data-slot="field"])': radius.lg,
    },
    borderWidth: {
      default: null,
      ':has(>[data-slot="field"])': '1px',
    },
    borderStyle: {
      default: null,
      ':has(>[data-slot="field"])': 'solid',
    },
    backgroundColor: {
      default: null,
      [HAS_CHECKED]: 'color-mix(in oklab, var(--primary) 5%, transparent)',
      ':is(.dark *)': {
        default: null,
        [HAS_CHECKED]: 'color-mix(in oklab, var(--primary) 10%, transparent)',
      },
    },
    borderColor: {
      default: null,
      [HAS_CHECKED]: 'color-mix(in oklab, var(--primary) 30%, transparent)',
      ':is(.dark *)': {
        default: null,
        [HAS_CHECKED]: 'color-mix(in oklab, var(--primary) 20%, transparent)',
      },
    },
    // `group-data-[disabled=true]/field:opacity-50`, plus the two rules `Label`
    // itself declares for this property. They have to be restated here:
    // `stylex.props` merges a property as a whole, so an `sx` that declares
    // `opacity` replaces `Label`'s conditions rather than adding to them —
    // which is what used to dim a `FieldLabel` whose `peer` control is
    // disabled (`checkbox-in-disabled-field`).
    opacity: {
      default: null,
      [IN_DISABLED_FIELD]: '50%',
      ':is(.group[data-disabled="true"] *)': '50%',
      ':is(.peer:disabled ~ *)': '50%',
    },
    // `*:data-[slot=field]:p-2.5` — the wrapped `Field`, which this file owns.
    paddingTop: { default: null, ':is(*)>[data-slot="field"]': '0.625rem' },
    paddingRight: { default: null, ':is(*)>[data-slot="field"]': '0.625rem' },
    paddingBottom: { default: null, ':is(*)>[data-slot="field"]': '0.625rem' },
    paddingLeft: { default: null, ':is(*)>[data-slot="field"]': '0.625rem' },
  },

  // `gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50
  //  flex w-fit items-center leading-snug`
  fieldTitle: {
    display: 'flex',
    width: 'fit-content',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    // `leading-snug`, a standalone ratio, kept as Tailwind has it
    lineHeight: 1.375,
    fontWeight: 500,
    opacity: {
      default: null,
      [IN_DISABLED_FIELD]: '50%',
    },
  },

  // `text-muted-foreground text-left text-sm [[data-variant=legend]+&]:-mt-1.5
  //  leading-normal font-normal group-has-data-horizontal/field:text-balance
  //  last:mt-0 nth-last-2:-mt-1`
  fieldDescription: {
    color: colors.mutedForeground,
    textAlign: 'left',
    fontSize: '0.875rem',
    // `leading-normal`
    lineHeight: 1.5,
    fontWeight: 400,
    // Three margin rules of equal specificity. Tailwind settles them by
    // emission order in `@layer utilities` — measured on the built CSS,
    // `last:mt-0` (683) comes before `nth-last-2:-mt-1` (966), and the
    // legend-sibling rule (1193) comes last, so it wins over both. StyleX
    // orders by its own per-condition priority and would put `:last-child`
    // (4054) above `:is([data-variant=legend]+*)` (4040), so the combinations
    // are written out.
    marginTop: {
      default: null,
      ':last-child': '0rem',
      ':nth-last-child(2)': '-0.25rem',
      ':is([data-variant="legend"]+*)': {
        default: '-0.375rem',
        ':last-child': '-0.375rem',
        ':nth-last-child(2)': '-0.375rem',
      },
    },
    // `group-has-data-horizontal/field:text-balance`. The compiled selector
    // looks for a *descendant* with `data-orientation="horizontal"`, not for
    // the `Field`'s own attribute, so a horizontal field does not balance its
    // own description. Copied as it is.
    textWrap: {
      default: null,
      ':is(.group\\/field:has([data-orientation="horizontal"]) *)': 'balance',
    },
  },

  // `-my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2 relative`
  fieldSeparator: {
    position: 'relative',
    height: '1.25rem',
    marginTop: '-0.5rem',
    marginBottom: {
      default: '-0.5rem',
      // Same value as `-my-2`; the rule exists in the original string and is
      // kept so the cascade stays identical.
      ':is(.group\\/field-group[data-variant="outline"] *)': '-0.5rem',
    },
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  /**
   * `absolute inset-0 top-1/2`, passed to `Separator` as `sx` now that it is
   * StyleX too (PR 07). `Separator` declares none of these four properties, so
   * nothing has to be restated.
   */
  fieldSeparatorLine: {
    position: 'absolute',
    top: '50%',
    insetInline: '0rem',
    bottom: '0rem',
  },
  // `text-muted-foreground px-2 bg-background relative mx-auto block w-fit`
  fieldSeparatorContent: {
    position: 'relative',
    display: 'block',
    width: 'fit-content',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
    backgroundColor: colors.background,
    color: colors.mutedForeground,
  },

  // `text-destructive text-sm font-normal`
  fieldError: {
    color: colors.destructive,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontWeight: 400,
  },
  // the list a multi-error `FieldError` renders: `ml-4 flex list-disc flex-col gap-1`
  fieldErrorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    marginLeft: '1rem',
    listStyleType: 'disc',
  },
})

/**
 * Rules that reach an element this file does not own, kept as Tailwind classes.
 *
 * A StyleX rule sits in a `priorityN` layer, below `utilities`, and layer order
 * beats specificity — so a rule that styles a foreign child would lose to any
 * utility on that child, where today it wins on specificity. Each entry names
 * the PR that removes it.
 */
const CHILD_CLASSES = {
  /** `*:w-full [&>.sr-only]:w-auto` — every direct child, whatever it is. */
  vertical: '*:w-full [&>.sr-only]:w-auto',
  /**
   * `has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px`
   * — whatever control the caller put inside the field, which is why it stays
   * a class even though `Checkbox` and `RadioGroupItem` are themselves StyleX
   * now: the rule has to keep beating a utility on that child. It goes when
   * the utility layer does (PR 32). (The compiled selector matches
   * `>[role=checkbox]` but any descendant `[role=radio]`; that asymmetry is
   * Tailwind's and is kept.)
   */
  horizontalChildren: 'has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
  /**
   * The same two rules inside the container query, plus the one that widens
   * every direct child there.
   */
  responsiveChildren:
    '@md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
} as const

function FieldSet({ className, style, ...props }: React.ComponentProps<'fieldset'>) {
  const sx = stylex.props(styles.fieldSet)

  return (
    <fieldset
      data-slot="field-set"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  style,
  variant = 'legend',
  ...props
}: React.ComponentProps<'legend'> & { variant?: 'legend' | 'label' }) {
  const sx = stylex.props(
    styles.fieldLegend,
    variant === 'label' ? styles.fieldLegendLabel : styles.fieldLegendLegend
  )

  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function FieldGroup({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.fieldGroup)

  return (
    <div
      data-slot="field-group"
      // `group/field-group` carries no styling of its own, but `FieldSeparator`
      // and the responsive `Field` still select through it.
      className={cn('group/field-group', sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

/**
 * Kept **unchanged** so Tailwind keeps emitting every class it names and so the
 * `orientation` prop keeps its type. `Field` itself no longer calls it; the
 * equivalent StyleX styles are above and every class has a comment there.
 * Removed with `cva` in PR 32.
 */
const fieldVariants = cva('data-[invalid=true]:text-destructive gap-2 group/field flex w-full', {
  variants: {
    orientation: {
      vertical: 'flex-col *:w-full [&>.sr-only]:w-auto',
      horizontal:
        'flex-row items-center *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
      responsive:
        'flex-col *:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:*:data-[slot=field-label]:flex-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
})

const ORIENTATION_STYLES = {
  vertical: styles.fieldVertical,
  horizontal: styles.fieldHorizontal,
  responsive: styles.fieldResponsive,
} as const

const ORIENTATION_CLASSES = {
  vertical: CHILD_CLASSES.vertical,
  horizontal: CHILD_CLASSES.horizontalChildren,
  responsive: `${CHILD_CLASSES.vertical} ${CHILD_CLASSES.responsiveChildren}`,
} as const

function Field({
  className,
  style,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
  const resolved = orientation ?? 'vertical'
  const sx = stylex.props(styles.field, ORIENTATION_STYLES[resolved])

  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={resolved}
      // `group/field` is selected through by `FieldLabel`, `FieldTitle` and
      // `FieldDescription`.
      className={cn('group/field', ORIENTATION_CLASSES[resolved], sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function FieldContent({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.fieldContent)

  return (
    <div
      data-slot="field-content"
      className={cn('group/field-content', sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      sx={styles.fieldLabel}
      // `leading-snug` has to stay a class: it is what `twMerge` removes
      // `Label`'s own `leading-none` with, and it also writes `--tw-leading`
      // for any `text-*` a caller adds. `group/field-label` and
      // `peer/field-label` carry no styling of their own.
      className={cn('group/field-label peer/field-label leading-snug', className)}
      {...props}
    />
  )
}

function FieldTitle({ className, style, ...props }: React.ComponentProps<'div'>) {
  const sx = stylex.props(styles.fieldTitle)

  return (
    <div
      // `data-slot="field-label"`, not `field-title`: the horizontal `Field`
      // and the `FieldLabel` box both select on it. Left as it is.
      data-slot="field-label"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function FieldDescription({ className, style, ...props }: React.ComponentProps<'p'>) {
  const sx = stylex.props(styles.fieldDescription)

  return (
    <p
      data-slot="field-description"
      // The three anchor rules style a link the caller wrote, so they stay
      // Tailwind until every caller of `FieldDescription` is StyleX (PR 32).
      className={cn(
        '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
        sx.className,
        className
      )}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}

function FieldSeparator({
  children,
  className,
  style,
  ...props
}: React.ComponentProps<'div'> & {
  children?: React.ReactNode
}) {
  const sx = stylex.props(styles.fieldSeparator)
  const content = stylex.props(styles.fieldSeparatorContent)

  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      <Separator sx={styles.fieldSeparatorLine} />
      {children && (
        <span
          className={content.className}
          style={content.style}
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

function FieldError({
  className,
  style,
  children,
  errors,
  ...props
}: React.ComponentProps<'div'> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const list = stylex.props(styles.fieldErrorList)
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className={list.className} style={list.style}>
        {uniqueErrors.map((error, index) => error?.message && <li key={index}>{error.message}</li>)}
      </ul>
    )
  }, [children, errors, list.className, list.style])

  if (!content) {
    return null
  }

  const sx = stylex.props(styles.fieldError)

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn(sx.className, className)}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    >
      {content}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
