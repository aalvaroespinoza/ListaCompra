import React from "react";
import { cn } from "@/utils/cn";

export interface HeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  avatar?: React.ReactNode;
}

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, title, subtitle, rightAction, leftAction, avatar, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          "flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md sticky top-0 z-30 border-b border-transparent transition-colors pt-safe",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          {leftAction}
          {avatar && <div className="shrink-0">{avatar}</div>}
          <div className="flex flex-col justify-center min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-text-primary leading-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[13px] font-medium text-text-tertiary capitalize">
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
