import { useMemo } from 'react'
import * as stylex from '@stylexjs/stylex'
import { colors, radius } from '@/styles/tokens.stylex'
import type { Sx } from '@/lib/sx'
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
    },
  },
  fieldGroupChildren: {
    gap: {
      default: null,
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
  fieldVertical: {
    flexDirection: 'column',
    width: {
      default: '100%',
    },
  },
  fieldVerticalChildren: {
    width: {
      default: null,
      ':is(*)>*': '100%',
      ':is(*)>.sr-only': 'auto',
    },
  },
  // `flex-row items-center has-[>[data-slot=field-content]]:items-start
  //  *:data-[slot=field-label]:flex-auto`
  fieldHorizontal: {
    flexDirection: 'row',
    alignItems: {
      default: 'center',
      ':has(>[data-slot="field-content"])': 'flex-start',
    },
  },
  fieldHorizontalChildren: {
    marginTop: {
      default: null,
      ':has(>[data-slot="field-content"])>[role="checkbox"]': '1px',
      ':has(>[data-slot="field-content"]) [role="radio"]': '1px',
    },
    // Targets `FieldLabel`/`FieldTitle`, which this file owns.
    flex: {
      default: null,
      ':is(*)>[data-slot="field-label"]': 'auto',
    },
  },
  // `flex-col` plus the `@md/field-group:` half of the responsive variant
  fieldResponsive: {
    width: {
      default: '100%',
    },
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
  },
  fieldResponsiveChildren: {
    width: {
      default: null,
      ':is(*)>*': '100%',
      ':is(*)>.sr-only': 'auto',
      [AT_MD_FIELD_GROUP]: {
        default: null,
        ':is(*)>*': 'auto',
      },
    },
    marginTop: {
      default: null,
      [AT_MD_FIELD_GROUP]: {
        default: null,
        ':has(>[data-slot="field-content"])>[role="checkbox"]': '1px',
        ':has(>[data-slot="field-content"]) [role="radio"]': '1px',
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
    lineHeight: 1.375,
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
  },
  fieldLabelChildren: {
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
    color: {
      default: colors.mutedForeground,
    },
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
  fieldDescriptionChildren: {
    textDecorationLine: { default: null, ':is(*)>a': 'underline' },
    textUnderlineOffset: { default: null, ':is(*)>a': '4px' },
    color: {
      default: null,
      ':is(*)>a:hover': colors.primary,
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
function FieldSet({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'fieldset'> & {
  sx?: Sx
}) {
  const sx = stylex.props(styles.fieldSet, sxProp)
  return (
    <fieldset
      data-slot="field-set"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}
function FieldLegend({
  className,
  style,
  sx: sxProp,
  variant = 'legend',
  ...props
}: React.ComponentProps<'legend'> & {
  variant?: 'legend' | 'label'
  sx?: Sx
}) {
  const sx = stylex.props(
    styles.fieldLegend,
    variant === 'label' ? styles.fieldLegendLabel : styles.fieldLegendLegend,
    sxProp
  )
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}
function FieldGroup({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & {
  sx?: Sx
}) {
  const sx = stylex.props(styles.fieldGroup, sxProp)
  return (
    <div
      data-slot="field-group"
      // `group/field-group` carries no styling of its own, but `FieldSeparator`
      // and the responsive `Field` still select through it.
      className={[
        'group/field-group',
        sx.className,
        stylex.props(styles.fieldGroupChildren).className,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}
const ORIENTATION_STYLES = {
  vertical: styles.fieldVertical,
  horizontal: styles.fieldHorizontal,
  responsive: styles.fieldResponsive,
} as const
function Field({
  className,
  style,
  sx: sxProp,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<'div'> & {
  orientation?: 'vertical' | 'horizontal' | 'responsive' | null
  sx?: Sx
}) {
  const resolved = orientation
  const sx = stylex.props(styles.field, resolved && ORIENTATION_STYLES[resolved], sxProp)
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={resolved}
      // `group/field` is selected through by `FieldLabel`, `FieldTitle` and
      // `FieldDescription`.
      className={[
        'group/field',
        sx.className,
        stylex.props(
          resolved === 'vertical'
            ? styles.fieldVerticalChildren
            : resolved === 'horizontal'
              ? styles.fieldHorizontalChildren
              : resolved === 'responsive'
                ? styles.fieldResponsiveChildren
                : null
        ).className,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}
function FieldContent({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & {
  sx?: Sx
}) {
  const sx = stylex.props(styles.fieldContent, sxProp)
  return (
    <div
      data-slot="field-content"
      className={['group/field-content', sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}
function FieldLabel({ className, sx: sxProp, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      sx={[styles.fieldLabel, sxProp]}
      className={[
        'group/field-label peer/field-label',
        stylex.props(styles.fieldLabelChildren).className,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}
function FieldTitle({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & {
  sx?: Sx
}) {
  const sx = stylex.props(styles.fieldTitle, sxProp)
  return (
    <div
      // `data-slot="field-label"`, not `field-title`: the horizontal `Field`
      // and the `FieldLabel` box both select on it. Left as it is.
      data-slot="field-label"
      className={[sx.className, className].filter(Boolean).join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}
function FieldDescription({
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'p'> & {
  sx?: Sx
}) {
  const sx = stylex.props(styles.fieldDescription, sxProp)
  return (
    <p
      data-slot="field-description"
      className={[sx.className, stylex.props(styles.fieldDescriptionChildren).className, className]
        .filter(Boolean)
        .join(' ')}
      style={sx.style || style ? { ...sx.style, ...style } : undefined}
      {...props}
    />
  )
}
function FieldSeparator({
  children,
  className,
  style,
  sx: sxProp,
  ...props
}: React.ComponentProps<'div'> & {
  sx?: Sx
  children?: React.ReactNode
}) {
  const sx = stylex.props(styles.fieldSeparator, sxProp)
  const content = stylex.props(styles.fieldSeparatorContent)
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={[sx.className, className].filter(Boolean).join(' ')}
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
  sx: sxProp,
  children,
  errors,
  ...props
}: React.ComponentProps<'div'> & {
  sx?: Sx
  errors?: Array<
    | {
        message?: string
      }
    | undefined
  >
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
  const sx = stylex.props(styles.fieldError, sxProp)
  return (
    <div
      role="alert"
      data-slot="field-error"
      className={[sx.className, className].filter(Boolean).join(' ')}
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
