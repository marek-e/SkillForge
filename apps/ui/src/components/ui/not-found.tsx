import * as stylex from '@stylexjs/stylex'
import { fonts } from '@/styles/tokens.stylex'
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
  title: { fontWeight: 900, fontFamily: fonts.serif, fontSize: '6rem', lineHeight: 1 },
  description: { textWrap: 'nowrap' },
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

export function NotFound() {
  const page = stylex.props(styles.page)
  const actions = stylex.props(styles.actions)

  return (
    <div className={page.className} style={page.style}>
      <Empty>
        <EmptyHeader>
          <EmptyTitle sx={styles.title}>404</EmptyTitle>
          <EmptyDescription sx={styles.description}>
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
