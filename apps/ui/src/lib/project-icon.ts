import { createAvatar } from '@dicebear/core'
import { identicon } from '@dicebear/collection'

/**
 * Generates a deterministic identicon SVG data URI from a seed string.
 */
function generateIdenticon(seed: string): string {
  const avatar = createAvatar(identicon, {
    seed,
    size: 128,
  })
  return avatar.toDataUri()
}

/**
 * Resolves the icon source for a project.
 * Priority: custom iconPath > generated identicon from path.
 */
export function getProjectIconSource(
  iconPath: string | null | undefined,
  projectPath: string
): string {
  if (iconPath && iconPath.trim()) {
    return iconPath.trim()
  }
  return generateIdenticon(projectPath)
}
