import React from "react";
import { cn } from "@/utils/cn";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  withBottomNav?: boolean;
}

export const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, children, withBottomNav = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-[100dvh] flex-col mx-auto w-full max-w-md relative bg-background shadow-sm sm:border-x border-border overflow-hidden",
          className
        )}
        {...props}
      >
        <main 
          className={cn(
            "flex-1 overflow-y-auto px-4",
            withBottomNav ? "pb-24" : "pb-safe" // Extra padding if bottom nav is present
          )}
        >
          {children}
        </main>
      </div>
    );
  }
);
PageContainer.displayName = "PageContainer";
