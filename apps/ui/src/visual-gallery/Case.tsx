import { colors, fonts, typography } from '@/styles/tokens.stylex'
import * as stylex from '@stylexjs/stylex'
import type { ReactNode } from 'react'

/**
 * Wraps one gallery case. The label sits outside `data-gallery-case` so an
 * element screenshot only captures the component under test.
 */
export function Case({
  name,
  children,
  width,
}: {
  name: string
  children: ReactNode
  /** Fixed pixel width for cases whose natural width depends on the viewport. */
  width?: number
}) {
  return (
    <div {...stylex.props(galleryStyles.case0)}>
      <span {...stylex.props(galleryStyles.case1)}>{name}</span>
      <div
        data-gallery-case={name}
        style={width ? { width: `${width}px` } : undefined}
        className={[stylex.props(galleryStyles.case2).className, 'w-explicit'].join(' ')}
      >
        {children}
      </div>
    </div>
  )
}

export function CaseRow({ children }: { children: ReactNode }) {
  return <div {...stylex.props(galleryStyles.case3)}>{children}</div>
}

export function CaseGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div {...stylex.props(galleryStyles.case4)}>
      <h2 {...stylex.props(galleryStyles.case5)}>{title}</h2>
      {children}
    </div>
  )
}

const galleryStyles = stylex.create({
  case0: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  case1: {
    fontFamily: fonts.mono,
    fontSize: '10px',
    lineHeight: 'inherit',
    color: colors.mutedForeground,
  },
  case2: { width: 'fit-content' },
  case3: { display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '1.5rem' },
  case4: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '0.75rem' },
  },
  case5: {
    fontFamily: fonts.mono,
    fontSize: '0.75rem',
    lineHeight: typography.xsLineHeight,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '.05em',
    color: colors.mutedForeground,
  },
})
