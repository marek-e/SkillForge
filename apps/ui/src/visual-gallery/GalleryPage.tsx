import { colors, fonts, typography } from '@/styles/tokens.stylex'
import * as stylex from '@stylexjs/stylex'
import { Link } from '@tanstack/react-router'
import { GALLERY_SECTIONS } from './sections'

/**
 * Test-only component gallery. Mounted only when `VITE_VISUAL_GALLERY=true`.
 * It renders every SkillForge-owned UI component in the states the visual
 * regression suite freezes, including states no route mounts.
 */
export function GalleryPage({ section }: { section: string }) {
  const match = GALLERY_SECTIONS.find((entry) => entry.id === section)

  if (!match) {
    return (
      <div data-gallery-section="unknown" {...stylex.props(galleryStyles.case0)}>
        <h1 {...stylex.props(galleryStyles.case1)}>Unknown gallery section</h1>
        <ul {...stylex.props(galleryStyles.case2)}>
          {GALLERY_SECTIONS.map((entry) => (
            <li key={entry.id}>
              <Link
                to="/__gallery/$section"
                params={{ section: entry.id }}
                {...stylex.props(galleryStyles.case3)}
              >
                {entry.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const { Component } = match

  return (
    <div data-gallery-section={match.id} {...stylex.props(galleryStyles.case4)}>
      <h1 {...stylex.props(galleryStyles.case5)}>gallery / {match.id}</h1>
      <Component />
    </div>
  )
}

const galleryStyles = stylex.create({
  case0: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '1rem' },
  },
  case1: { fontSize: '1.5rem', lineHeight: typography.xxlLineHeight, fontWeight: 600 },
  case2: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '0.25rem' },
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
  },
  case3: { textDecorationLine: 'underline', textUnderlineOffset: '4px' },
  case4: {
    marginBlockStart: { default: null, ':is(*)>:not(:last-child)': '0rem' },
    marginBlockEnd: { default: null, ':is(*)>:not(:last-child)': '1.5rem' },
  },
  case5: {
    fontFamily: fonts.mono,
    fontSize: '0.875rem',
    lineHeight: typography.smLineHeight,
    color: colors.mutedForeground,
  },
})
