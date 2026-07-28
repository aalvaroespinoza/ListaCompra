import React from "react";
import { cn } from "@/utils/cn";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn("mt-6 mb-2", className)}
        {...props}
      >
        {title && (
          <div className="px-2 mb-2">
            <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">
              {title}
            </h2>
          </div>
        )}
        <div className="space-y-2">
          {children}
        </div>
      </section>
    );
  }
);
Section.displayName = "Section";
