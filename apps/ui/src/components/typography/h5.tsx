import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const h5Variants = cva(
  "scroll-m-20 text-lg font-semibold tracking-tight",
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

export interface H5Props
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof h5Variants> {}

const H5 = React.forwardRef<HTMLHeadingElement, H5Props>(
  ({ className, variant, ...props }, ref) => {
    return (
      <h5
        ref={ref}
        className={cn(h5Variants({ variant, className }))}
        {...props}
      />
    )
  }
)
H5.displayName = "H5"

export { H5, h5Variants }
