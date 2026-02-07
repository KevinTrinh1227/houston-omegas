'use client';

import { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export default function Select({ label, options, error, className = '', ...rest }: SelectProps) {
  return (
    <div>
      {label && (
        <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className={`w-full px-3 py-2.5 bg-dash-input border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 outline-none transition-all ${
          error ? 'border-red-300 dark:border-red-700' : 'border-dash-input-border'
        } ${className}`}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
