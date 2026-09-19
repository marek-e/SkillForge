import { createRoute, lazyRouteComponent, type AnyRoute } from '@tanstack/react-router'
import { rootRoute } from '@/routes/__root'

function createGalleryRoute(): AnyRoute {
  return createRoute({
    getParentRoute: () => rootRoute,
    path: '/__gallery/$section',
    component: lazyRouteComponent(() => import('./GallerySectionPage'), 'GallerySectionPage'),
  })
}

/**
 * The gallery route only exists when the UI is served or built with
 * `VITE_VISUAL_GALLERY=true`.
 *
 * Vite replaces the flag with a literal, so without it `createGalleryRoute` is
 * unreachable and Rollup drops both the function and the dynamic import, which
 * means no gallery chunk is emitted at all. `pnpm visual:check-gallery` asserts
 * that by grepping the production build.
 */
export const galleryRoutes: AnyRoute[] =
  import.meta.env.VITE_VISUAL_GALLERY === 'true' ? [createGalleryRoute()] : []
