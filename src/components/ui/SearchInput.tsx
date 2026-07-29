import React from "react";
import { Search, XCircle } from "lucide-react";
import { cn } from "@/utils/cn";

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <div className="absolute left-3 text-text-tertiary flex items-center pointer-events-none">
          <Search size={20} />
        </div>
        <input
          ref={ref}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-label="Buscar producto"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "flex h-12 w-full rounded-full bg-border/50 px-11 py-2 text-[16px] text-text-primary transition-colors",
            "placeholder:text-text-tertiary focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/50",
            /* Hide default webkit clear button */
            "[&::-webkit-search-cancel-button]:hidden",
            className
          )}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 p-2 flex items-center justify-center text-text-tertiary hover:text-text-secondary active:text-text-primary transition-colors active:scale-90"
            aria-label="Limpiar búsqueda"
          >
            <XCircle size={18} className="fill-text-tertiary text-surface" />
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";
