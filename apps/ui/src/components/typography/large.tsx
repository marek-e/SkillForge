import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const largeVariants = cva(
  "text-lg font-semibold",
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

export interface LargeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof largeVariants> {}

const Large = React.forwardRef<HTMLDivElement, LargeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(largeVariants({ variant, className }))}
        {...props}
      />
    )
  }
)
Large.displayName = "Large"

export { Large, largeVariants }
