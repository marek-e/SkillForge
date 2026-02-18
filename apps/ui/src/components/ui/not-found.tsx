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

export function NotFound() {
  return (
    <div className="flex w-full items-center justify-center overflow-hidden h-full">
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="font-black font-serif text-8xl">404</EmptyTitle>
          <EmptyDescription className="text-nowrap">
            The page you're looking for might have been <br />
            moved or doesn't exist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
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
