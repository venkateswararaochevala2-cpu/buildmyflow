import React, { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:opacity-50 disabled:pointer-events-none rounded select-none';

    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
      secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300 border border-zinc-200',
      outline: 'bg-white text-zinc-800 border border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100',
      ghost: 'bg-transparent text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200',
      destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    };

    const sizes = {
      sm: 'text-xs h-7 px-2.5 gap-1.5',
      md: 'text-sm h-8 px-3.5 gap-2',
      lg: 'text-sm h-10 px-4 gap-2',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={twMerge(clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className))}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
