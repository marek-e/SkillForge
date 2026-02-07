import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const leadVariants = cva('text-xl text-muted-foreground', {
  variants: {
    variant: {
      default: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface LeadProps
  extends React.HTMLAttributes<HTMLParagraphElement>, VariantProps<typeof leadVariants> {}

const Lead = React.forwardRef<HTMLParagraphElement, LeadProps>(
  ({ className, variant, ...props }, ref) => {
    return <p ref={ref} className={cn(leadVariants({ variant, className }))} {...props} />
  }
)
Lead.displayName = 'Lead'

export { Lead, leadVariants }
