import React from "react";
import { cn } from "@/utils/cn";
import { Inbox } from "lucide-react";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, title, description, icon = <Inbox size={48} strokeWidth={1} />, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center p-8 text-center min-h-[300px]",
          className
        )}
        {...props}
      >
        <div className="mb-4 text-text-tertiary">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold text-text-primary">
          {title}
        </h3>
        {description && (
          <p className="mb-6 max-w-sm text-sm text-text-secondary">
            {description}
          </p>
        )}
        {action && <div>{action}</div>}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";
