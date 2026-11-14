import { useParams } from '@tanstack/react-router'
import { GalleryPage } from './GalleryPage'

export function GallerySectionPage() {
  const { section } = useParams({ strict: false }) as { section?: string }
  return <GalleryPage section={section ?? ''} />
}
