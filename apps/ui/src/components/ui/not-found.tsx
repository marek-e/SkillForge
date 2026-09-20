import * as stylex from '@stylexjs/stylex'
import { Link } from '@tanstack/react-router'
// import { Button } from './button'

// export function NotFound() {
//   return (
//     <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
//       <p className="text-muted-foreground text-8xl font-bold">404</p>
//       <h1 className="text-2xl font-semibold">Page not found</h1>
//       <p className="text-muted-foreground">
//         The page you're looking for doesn't exist.
//       </p>
//       <Button asChild variant="outline">
//         <Link to="/">Go home</Link>
//       </Button>
//     </div>
//   )
// }

// import { FullWidthDivider } from "@/components/ui/full-width-divider";
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { HomeIcon, CompassIcon } from 'lucide-react'

const styles = stylex.create({
  // `flex w-full items-center justify-center overflow-hidden h-full`
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  // `flex gap-2`
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
})

/**
 * The two `className` strings below stay Tailwind: they are a caller
 * overriding `EmptyTitle` and `EmptyDescription`, and a utility still wins over
 * the StyleX declarations it replaces, exactly as `twMerge` made it win before.
 * They become an `sx` when `empty.tsx` loses its `className` bridge (PR 32).
 */
export function NotFound() {
  const page = stylex.props(styles.page)
  const actions = stylex.props(styles.actions)

  return (
    <div className={page.className} style={page.style}>
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="font-black font-serif text-8xl">404</EmptyTitle>
          <EmptyDescription className="text-nowrap">
            The page you're looking for might have been <br />
            moved or doesn't exist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className={actions.className} style={actions.style}>
            <Button asChild>
              <Link to="/">
                <HomeIcon data-icon="inline-start" />
                Go Home
              </Link>
            </Button>

            <Button asChild variant="outline">
              <Link to="/">
                <CompassIcon data-icon="inline-start" />
                Explore
              </Link>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  )
}
