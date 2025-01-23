import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const BinderTabs = TabsPrimitive.Root

const BinderTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "relative flex h-12 w-full items-end gap-1 bg-background",
      className
    )}
    {...props}
  />
))
BinderTabsList.displayName = TabsPrimitive.List.displayName

const BinderTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "group relative inline-flex h-9 items-center justify-center whitespace-nowrap rounded-t-lg px-6 py-3 text-sm font-medium ring-offset-background transition-all",
      "before:absolute before:left-0 before:top-0 before:h-full before:w-[1px] before:bg-muted before:transition-all",
      "after:absolute after:right-0 after:top-0 after:h-full after:w-[1px] after:bg-muted after:transition-all",
      "data-[state=active]:z-10 data-[state=active]:h-11 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-[0_-8px_8px_-4px_rgba(0,0,0,0.05)]",
      "data-[state=active]:before:bg-muted data-[state=active]:after:bg-muted",
      "data-[state=inactive]:bg-muted/50 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80",
      className
    )}
    {...props}
  />
))
BinderTabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const BinderTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "relative mt-[-1px] rounded-b-lg border bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]",
      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
BinderTabsContent.displayName = TabsPrimitive.Content.displayName

export { BinderTabs, BinderTabsList, BinderTabsTrigger, BinderTabsContent } 