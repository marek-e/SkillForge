import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const pVariants = cva('leading-7 [&:not(:first-child)]:mt-6', {
  variants: {
    variant: {
      default: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface PProps
  extends React.HTMLAttributes<HTMLParagraphElement>, VariantProps<typeof pVariants> {}

const P = React.forwardRef<HTMLParagraphElement, PProps>(
  ({ className, variant, ...props }, ref) => {
    return <p ref={ref} className={cn(pVariants({ variant, className }))} {...props} />
  }
)
P.displayName = 'P'

export { P, pVariants }
