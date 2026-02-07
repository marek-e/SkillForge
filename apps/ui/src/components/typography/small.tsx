import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const smallVariants = cva('text-sm font-medium leading-none', {
  variants: {
    variant: {
      default: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface SmallProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof smallVariants> {}

const Small = React.forwardRef<HTMLElement, SmallProps>(({ className, variant, ...props }, ref) => {
  return <small ref={ref} className={cn(smallVariants({ variant, className }))} {...props} />
})
Small.displayName = 'Small'

export { Small, smallVariants }
