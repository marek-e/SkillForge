import * as stylex from '@stylexjs/stylex'
import { WrenchIcon } from 'lucide-react'
import type { SkillViewMode } from '@/lib/skill-view'
import { colors, motion } from '@/styles/tokens.stylex'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * The three class lists this component hands to `card.tsx`, kept as Tailwind
 * (PR 32).
 *
 * `Card`, `CardTitle` and `CardContent` are StyleX but take no `sx` prop, so a
 * caller's styling still arrives as a `className` that `cn` appends — and
 * `Card`'s own ring is the reason the grid card's hover class cannot become a
 * StyleX declaration either: `ring-1 ring-foreground/10` stays a utility on that
 * element and composes its `box-shadow` from `--tw-ring-color`, which
 * `hover:ring-foreground/20` is what sets. A StyleX `boxShadow` would write the
 * property instead of the variable, in a `priorityN` layer the `ring-1` utility
 * outranks, so the card would stop reacting to the pointer altogether
 * (`card.tsx`, "the ring").
 *
 * `space-y-2` is a child rule — `:where(& > :not(:last-child))` — over the two
 * elements `CardContent` wraps, and `flex items-center gap-2` sits on an
 * element this component does not own.
 */

const styles = stylex.create({
  // `size-3.5 text-muted-foreground shrink-0`
  gridIcon: {
    width: '0.875rem',
    height: '0.875rem',
    flexShrink: 0,
    color: colors.mutedForeground,
  },

  // `truncate`
  gridName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // `text-sm text-muted-foreground line-clamp-2`
  gridDescription: {
    // `line-clamp-2`, whose `overflow: hidden` and `-webkit-box` are what make
    // the clamp apply at all.
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    color: colors.mutedForeground,
    // A paragraph of plain text with no descendant of its own, so the paired
    // line height is written as the length it resolves to.
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },

  // `flex flex-wrap gap-1`
  gridBadges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
  },

  // `flex items-start gap-3 py-2.5`
  listRoot: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    paddingBlock: '0.625rem',
  },

  // `cursor-pointer hover:bg-muted/50 -mx-2 px-2`
  listRootClickable: {
    cursor: 'pointer',
    backgroundColor: {
      default: null,
      '@media (hover: hover)': {
        default: null,
        ':hover': 'color-mix(in oklab, var(--muted) 50%, transparent)',
      },
    },
    // `-mx-*` and `px-*` are both logical, as Tailwind writes them.
    marginInline: '-0.5rem',
    paddingInline: '0.5rem',
  },

  // `size-4 text-muted-foreground mt-0.5 shrink-0`
  listIcon: {
    width: '1rem',
    height: '1rem',
    flexShrink: 0,
    marginTop: '0.125rem',
    color: colors.mutedForeground,
  },

  // `min-w-0 flex-1`
  listBody: {
    minWidth: '0rem',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
  },

  // `flex items-center gap-2 flex-wrap`
  listTitleRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },

  // `font-medium text-sm`
  listName: {
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },

  // `text-sm text-muted-foreground`
  listDescription: {
    color: colors.mutedForeground,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
})

interface SkillCardProps {
  viewMode: SkillViewMode
  name: string
  description: string
  badges?: React.ReactNode
  actions?: React.ReactNode
  onClick?: () => void
}

export function SkillCard({
  viewMode,
  name,
  description,
  badges,
  actions,
  onClick,
}: SkillCardProps) {
  if (viewMode === 'grid') {
    return (
      <Card
        size="sm"
        sx={onClick ? overrideStyles.CARD_HOVER_CLASSES : undefined}
        onClick={onClick}
      >
        <CardHeader>
          <CardTitle sx={overrideStyles.CARD_TITLE_CLASSES}>
            <WrenchIcon {...stylex.props(styles.gridIcon)} />
            <span {...stylex.props(styles.gridName)}>{name}</span>
          </CardTitle>
          {actions && <CardAction>{actions}</CardAction>}
        </CardHeader>
        <CardContent sx={overrideStyles.CARD_CONTENT_CLASSES}>
          <p {...stylex.props(styles.gridDescription)}>{description}</p>
          {badges && <div {...stylex.props(styles.gridBadges)}>{badges}</div>}
        </CardContent>
      </Card>
    )
  }

  return (
    <div {...stylex.props(styles.listRoot, onClick && styles.listRootClickable)} onClick={onClick}>
      <WrenchIcon {...stylex.props(styles.listIcon)} />
      <div {...stylex.props(styles.listBody)}>
        <div {...stylex.props(styles.listTitleRow)}>
          <span {...stylex.props(styles.listName)}>{name}</span>
          {badges}
        </div>
        <p {...stylex.props(styles.listDescription)}>{description}</p>
      </div>
      {actions}
    </div>
  )
}

const overrideStyles = stylex.create({
  CARD_HOVER_CLASSES: {
    cursor: 'pointer',
    boxShadow: {
      default:
        '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent), 0 0 #0000',
      '@media (hover: hover)': {
        default: null,
        ':hover':
          '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 0 1px color-mix(in oklab, var(--foreground) 20%, transparent), 0 0 #0000',
      },
    },
    transitionProperty: 'box-shadow',
    transitionTimingFunction: motion.ease,
    transitionDuration: motion.duration,
  },
  CARD_TITLE_CLASSES: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  CARD_CONTENT_CLASSES: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '0.5rem' },
  },
})
