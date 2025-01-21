import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "rounded-lg border p-natural-lg transition-natural focus-within:ring-2 focus-within:ring-forest focus-within:ring-opacity-50",
  {
    variants: {
      variant: {
        default: "bg-pearl dark:bg-charcoal border-clay/20 dark:border-clay/10 shadow-natural",
        elevated: "bg-pearl dark:bg-charcoal border-clay/20 dark:border-clay/10 shadow-elevated",
        subtle: "bg-clay/5 dark:bg-clay/10 border-clay/10 dark:border-clay/5",
        outline: "border-forest dark:border-forest-light bg-transparent",
        glass: "bg-pearl/80 dark:bg-charcoal/80 backdrop-blur-sm border-clay/10",
      },
      hover: {
        true: "hover-lift",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      hover: true,
    },
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "div";
    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ variant, hover }), className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-natural-sm p-natural-lg border-b border-clay/10 dark:border-clay/5",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-display text-2xl leading-none tracking-tight text-forest dark:text-forest-light",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-slate dark:text-slate-light",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-natural-lg pt-0", className)} 
    {...props} 
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-natural-lg pt-0 border-t border-clay/20 dark:border-clay/10", 
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  type CardProps,
}; 