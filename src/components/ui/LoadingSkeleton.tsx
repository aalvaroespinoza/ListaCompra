import React from "react";
import { cn } from "@/utils/cn";

export interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: "circle" | "rect" | "text";
}

export const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  ({ className, shape = "rect", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-border/60",
          {
            "rounded-full": shape === "circle" || shape === "text",
            "rounded-xl": shape === "rect",
            "h-4 w-full": shape === "text",
          },
          className
        )}
        {...props}
      />
    );
  }
);
LoadingSkeleton.displayName = "LoadingSkeleton";
