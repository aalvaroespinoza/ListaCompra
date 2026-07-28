import React from "react";
import { cn } from "@/utils/cn";
import { Plus } from "lucide-react";

export interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

export const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className, icon = <Plus size={24} />, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "fixed right-6 bottom-safe-offset-6 z-40",
          "flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-ios",
          "transition-all active:scale-95 hover:bg-primary-hover",
          "disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100",
          className
        )}
        style={{
          // For iOS safe area + standard bottom padding
          bottom: "calc(env(safe-area-inset-bottom) + 1.5rem)"
        }}
        {...props}
      >
        {icon}
      </button>
    );
  }
);
FloatingActionButton.displayName = "FloatingActionButton";
