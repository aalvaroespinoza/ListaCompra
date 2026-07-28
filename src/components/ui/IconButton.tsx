import React from "react";
import { cn } from "@/utils/cn";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  rounded?: "full" | "xl";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      rounded = "full",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center shrink-0 transition-all",
          "active:scale-[0.92]", // Slightly more scale down for icon buttons
          "disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100",
          {
            "rounded-full": rounded === "full",
            "rounded-xl": rounded === "xl",
            "bg-primary text-white hover:bg-primary-hover active:bg-primary-active":
              variant === "primary",
            "bg-surface text-text-secondary border border-border hover:bg-surface-hover active:bg-surface-active hover:text-text-primary":
              variant === "secondary",
            "bg-transparent text-text-secondary hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/20":
              variant === "ghost",
            "bg-danger/10 text-danger hover:bg-danger/20 active:bg-danger/30":
              variant === "danger",
            "h-8 w-8": size === "sm",
            "h-10 w-10": size === "md",
            "h-12 w-12": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
