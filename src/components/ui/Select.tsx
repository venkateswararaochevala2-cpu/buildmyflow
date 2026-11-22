import React, { SelectHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, options, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-zinc-700">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={twMerge(
            clsx(
              'h-8 w-full rounded border border-zinc-300 bg-white px-2.5 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:bg-zinc-50 disabled:text-zinc-400 transition-colors cursor-pointer',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {hint && !error && <span className="text-[11px] text-zinc-500">{hint}</span>}
        {error && <span className="text-[11px] text-red-600 font-medium">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
