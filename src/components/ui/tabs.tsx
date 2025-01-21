import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva(
  "inline-flex items-center justify-center rounded-lg transition-natural",
  {
    variants: {
      variant: {
        default: "bg-pearl dark:bg-charcoal p-2",
        subtle: "bg-clay/10 dark:bg-clay/5 p-2",
        outline: "border border-clay/20 dark:border-clay/10 p-2",
      },
      size: {
        default: "h-10",
        sm: "h-8",
        lg: "h-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, size, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant, size }), className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-natural focus-natural disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: [
          "text-slate hover:text-slate-dark",
          "data-[state=active]:bg-forest data-[state=active]:text-pearl dark:data-[state=active]:bg-forest-light",
        ],
        subtle: [
          "text-stone hover:text-stone-dark",
          "data-[state=active]:bg-clay/20 data-[state=active]:text-stone-dark dark:data-[state=active]:bg-clay/10",
        ],
        outline: [
          "text-slate hover:text-slate-dark",
          "data-[state=active]:border-forest data-[state=active]:text-forest dark:data-[state=active]:border-forest-light",
        ],
      },
      size: {
        default: "text-sm",
        sm: "text-xs",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, size, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant, size }), className)}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-natural",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent }; 