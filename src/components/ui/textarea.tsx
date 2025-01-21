import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-clay/20 bg-pearl px-3 py-2 text-sm ring-offset-white placeholder:text-slate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-clay/10 dark:bg-charcoal dark:ring-offset-charcoal dark:placeholder:text-slate-light dark:focus-visible:ring-forest-light",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea } 