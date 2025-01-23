import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const progressVariants = cva(
  "relative h-2 w-full overflow-hidden rounded-full transition-natural",
  {
    variants: {
      variant: {
        default: "bg-forest/20 [&>div]:bg-forest dark:bg-forest-light/20 dark:[&>div]:bg-forest-light",
        secondary: "bg-slate/20 [&>div]:bg-slate dark:bg-slate-light/20 dark:[&>div]:bg-slate-light",
        accent: "bg-copper/20 [&>div]:bg-copper dark:bg-copper-light/20 dark:[&>div]:bg-copper-light",
        success: "bg-sage/20 [&>div]:bg-sage dark:bg-sage-light/20 dark:[&>div]:bg-sage-light",
      },
      size: {
        sm: "h-1",
        default: "h-2",
        lg: "h-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-muted",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress }; 