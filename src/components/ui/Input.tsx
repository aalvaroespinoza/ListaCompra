import React from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, icon, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        <div className="relative flex items-center" suppressHydrationWarning>
          {icon && (
            <div className="absolute left-4 text-text-tertiary flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            suppressHydrationWarning
            className={cn(
              "flex h-12 w-full rounded-xl bg-surface border border-border px-4 py-2 text-base text-text-primary transition-colors",
              "placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-11", // Add padding if icon exists
              error && "border-danger focus:ring-danger/50 focus:border-danger",
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-sm text-danger px-1">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
