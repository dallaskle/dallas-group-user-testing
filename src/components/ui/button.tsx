import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-forest text-pearl hover:bg-forest-light dark:bg-forest-light dark:hover:bg-forest",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-forest text-forest hover:bg-forest/10 dark:border-forest-light dark:text-forest-light dark:hover:bg-forest-light/10",
        secondary: "bg-slate text-pearl hover:bg-slate-light dark:bg-slate-light dark:hover:bg-slate",
        ghost: "hover:bg-clay/10 text-slate hover:text-slate-dark dark:text-slate-light dark:hover:bg-clay/5",
        link: "underline-offset-4 hover:underline text-forest dark:text-forest-light",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-8 px-3 py-1.5",
        lg: "h-12 px-6 py-2.5",
        icon: "h-10 w-10 p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 