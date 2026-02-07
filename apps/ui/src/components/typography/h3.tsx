import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const h3Variants = cva('scroll-m-20 text-2xl font-semibold tracking-tight', {
  variants: {
    variant: {
      default: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface H3Props
  extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof h3Variants> {}

const H3 = React.forwardRef<HTMLHeadingElement, H3Props>(
  ({ className, variant, ...props }, ref) => {
    return <h3 ref={ref} className={cn(h3Variants({ variant, className }))} {...props} />
  }
)
H3.displayName = 'H3'

export { H3, h3Variants }
