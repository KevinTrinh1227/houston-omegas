'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

const variants = {
  primary:
    'bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50',
  secondary:
    'text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border hover:border-dash-text-muted transition-all disabled:opacity-50',
  danger:
    'bg-red-600 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  loading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`${variants[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
