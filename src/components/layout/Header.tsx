import React from "react";
import { cn } from "@/utils/cn";

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
}

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, title, subtitle, rightAction, leftAction, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          "flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md sticky top-0 z-30 border-b border-transparent transition-colors pt-safe",
          // Scroll effect class could be added here dynamically based on scroll position
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-4">
          {leftAction}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm font-medium text-text-secondary">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {rightAction && (
          <div className="flex shrink-0 items-center">
            {rightAction}
          </div>
        )}
      </header>
    );
  }
);
Header.displayName = "Header";
