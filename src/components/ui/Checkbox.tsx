import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  sublabel?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, sublabel, disabled, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="flex items-start gap-4">
        <div className="relative flex items-center justify-center pt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            disabled={disabled}
            className={cn(
              "peer h-6 w-6 appearance-none rounded-full border-2 border-border bg-surface transition-all",
              "checked:border-primary checked:bg-primary",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "active:scale-90", // Satisfying press effect
              className
            )}
            {...props}
          />
          <Check
            size={14}
            strokeWidth={3}
            className="absolute text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none"
          />
        </div>
        {(label || sublabel) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  "text-lg font-medium select-none cursor-pointer text-text-primary transition-colors",
                  "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                  "peer-checked:text-text-secondary peer-checked:line-through peer-checked:decoration-border-hover peer-checked:decoration-2"
                )}
              >
                {label}
              </label>
            )}
            {sublabel && (
              <p className="text-sm text-text-tertiary">{sublabel}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
