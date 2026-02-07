import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const h4Variants = cva('scroll-m-20 text-xl font-semibold tracking-tight', {
  variants: {
    variant: {
      default: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface H4Props
  extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof h4Variants> {}

const H4 = React.forwardRef<HTMLHeadingElement, H4Props>(
  ({ className, variant, ...props }, ref) => {
    return <h4 ref={ref} className={cn(h4Variants({ variant, className }))} {...props} />
  }
)
H4.displayName = 'H4'

export { H4, h4Variants }
