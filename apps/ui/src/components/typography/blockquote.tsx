import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const blockquoteVariants = cva('mt-6 border-l-2 pl-6 italic', {
  variants: {
    variant: {
      default: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface BlockquoteProps
  extends React.HTMLAttributes<HTMLQuoteElement>, VariantProps<typeof blockquoteVariants> {}

const Blockquote = React.forwardRef<HTMLQuoteElement, BlockquoteProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <blockquote ref={ref} className={cn(blockquoteVariants({ variant, className }))} {...props} />
    )
  }
)
Blockquote.displayName = 'Blockquote'

export { Blockquote, blockquoteVariants }
