'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  message: string;
  action?: { label: string; onClick: () => void };
  icon?: ReactNode;
}

export default function EmptyState({ message, action, icon }: EmptyStateProps) {
  return (
    <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
      {icon && <div className="mb-3 text-dash-text-muted flex justify-center">{icon}</div>}
      <p className="text-dash-text-muted text-sm">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
