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
      <div data-gallery-section="unknown" className="space-y-4">
        <h1 className="text-2xl font-semibold">Unknown gallery section</h1>
        <ul className="space-y-1 text-sm">
          {GALLERY_SECTIONS.map((entry) => (
            <li key={entry.id}>
              <Link
                to="/__gallery/$section"
                params={{ section: entry.id }}
                className="underline underline-offset-4"
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
    <div data-gallery-section={match.id} className="space-y-6">
      <h1 className="font-mono text-sm text-muted-foreground">gallery / {match.id}</h1>
      <Component />
    </div>
  )
}
