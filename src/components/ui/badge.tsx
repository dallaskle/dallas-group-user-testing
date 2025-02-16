import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold transition-natural focus-natural",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-forest text-pearl hover:bg-forest-light dark:bg-forest-light dark:hover:bg-forest",
        secondary:
          "border-transparent bg-slate text-pearl hover:bg-slate-light dark:bg-slate-light dark:hover:bg-slate",
        accent:
          "border-transparent bg-copper text-pearl hover:bg-copper-light dark:bg-copper-light dark:hover:bg-copper",
        success:
          "border-transparent bg-sage text-charcoal hover:bg-sage-light dark:bg-sage-light dark:hover:bg-sage",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: 
          "border-forest text-forest hover:bg-forest/10 dark:border-forest-light dark:text-forest-light dark:hover:bg-forest-light/10",
        subtle:
          "bg-clay/20 text-stone hover:bg-clay/30 dark:bg-clay/10 dark:text-stone-light dark:hover:bg-clay/20",
        glass:
          "bg-pearl/80 backdrop-blur-sm text-forest border-clay/10 hover:bg-pearl/90 dark:bg-charcoal/80 dark:text-forest-light dark:hover:bg-charcoal/90",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-1 text-[10px]",
        lg: "px-4 py-1.5 text-sm",
        xl: "px-6 py-2 text-base",
      },
      interactive: {
        true: "cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest focus:ring-opacity-50",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ 
  className, 
  variant, 
  size, 
  interactive,
  asChild = false,
  ...props 
}: BadgeProps) {
  const Comp = asChild ? React.Fragment : "div";
  return (
    <Comp
      role={interactive ? "button" : "status"}
      tabIndex={interactive ? 0 : undefined}
      className={cn(badgeVariants({ variant, size, interactive }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants }; 