import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const codeVariants = cva(
  "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
  {
    variants: {
      variant: {
        default: "",
        block: "block w-full overflow-x-auto rounded-lg border bg-muted p-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CodeProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof codeVariants> {}

const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ className, variant, ...props }, ref) => {
    const Comp = variant === "block" ? "pre" : "code"
    return (
      <Comp
        ref={ref as any}
        className={cn(codeVariants({ variant, className }))}
        {...props}
      />
    )
  }
)
Code.displayName = "Code"

export { Code, codeVariants }
