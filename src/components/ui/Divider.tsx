import React from "react";
import { cn } from "@/utils/cn";

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn(
          "shrink-0 bg-border border-0",
          {
            "h-px w-full": orientation === "horizontal",
            "h-full w-px": orientation === "vertical",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Divider.displayName = "Divider";
