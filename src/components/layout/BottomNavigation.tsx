"use client";

import React from "react";
import { cn } from "@/utils/cn";
import { useViewportHeight } from "@/hooks/use-viewport-height";

export interface BottomNavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

export interface BottomNavigationProps extends React.HTMLAttributes<HTMLElement> {
  items: BottomNavItem[];
}

export const BottomNavigation = React.forwardRef<HTMLElement, BottomNavigationProps>(
  ({ className, items, style, ...props }, ref) => {
    const { keyboardOffset } = useViewportHeight();

    return (
      <nav
        ref={ref}
        className={cn(
          "fixed w-full max-w-md bg-surface/85 backdrop-blur-xl border-t border-border pb-safe z-30",
          className
        )}
        style={{ bottom: `${keyboardOffset}px`, ...style }}
        {...props}
      >
        <ul className="flex items-center justify-around h-16 px-2">
          {items.map((item) => (
            <li key={item.id} className="flex-1 flex justify-center">
              <button
                onClick={item.onClick}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-all",
                  item.isActive ? "text-primary" : "text-text-secondary hover:text-text-primary"
                )}
              >
                <div className={cn("transition-transform", item.isActive && "scale-110")}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-medium leading-none mt-1">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  }
);
BottomNavigation.displayName = "BottomNavigation";
