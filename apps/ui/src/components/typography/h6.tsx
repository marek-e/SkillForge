import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const h6Variants = cva(
  "scroll-m-20 text-base font-semibold tracking-tight",
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

export interface H6Props
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof h6Variants> {}

const H6 = React.forwardRef<HTMLHeadingElement, H6Props>(
  ({ className, variant, ...props }, ref) => {
    return (
      <h6
        ref={ref}
        className={cn(h6Variants({ variant, className }))}
        {...props}
      />
    )
  }
)
H6.displayName = "H6"

export { H6, h6Variants }
