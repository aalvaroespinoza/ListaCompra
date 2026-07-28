import React from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
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
          "inline-flex items-center justify-center rounded-xl font-medium transition-all",
          "active:scale-[0.97]", // iOS style press effect
          "disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100",
          {
            "bg-primary text-white hover:bg-primary-hover active:bg-primary-active":
              variant === "primary",
            "bg-surface text-text-primary border border-border hover:bg-surface-hover active:bg-surface-active":
              variant === "secondary",
            "bg-danger text-white hover:opacity-90 active:opacity-80":
              variant === "danger",
            "bg-transparent text-primary hover:bg-primary/10 active:bg-primary/20":
              variant === "ghost",
            "h-9 px-4 text-sm": size === "sm",
            "h-12 px-6 text-base": size === "md",
            "h-14 px-8 text-lg": size === "lg",
            "w-full": fullWidth,
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
Button.displayName = "Button";
