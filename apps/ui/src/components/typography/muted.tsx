import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const mutedVariants = cva(
  "text-sm text-muted-foreground",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface MutedProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof mutedVariants> {}

const Muted = React.forwardRef<HTMLParagraphElement, MutedProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(mutedVariants({ variant, className }))}
        {...props}
      />
    )
  }
)
Muted.displayName = "Muted"

export { Muted, mutedVariants }
