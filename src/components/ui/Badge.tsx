import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'sm', className }) => {
  const variants = {
    default: 'bg-zinc-800 text-white',
    secondary: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
    outline: 'border border-zinc-300 text-zinc-700 bg-white',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    error: 'bg-rose-50 text-rose-800 border border-rose-200',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 font-medium rounded',
    md: 'text-xs px-2 py-0.5 font-medium rounded',
  };

  return <span className={clsx('inline-flex items-center', variants[variant], sizes[size], className)}>{children}</span>;
};
