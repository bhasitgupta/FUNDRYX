import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-emerald-600 text-white",
        secondary: "border-transparent bg-emerald-950/70 text-emerald-300 border border-emerald-800/50",
        destructive: "border-transparent bg-rose-950 text-rose-300 border border-rose-800/50",
        outline: "border-[#263e30] text-[#8fa799]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
export default Badge
