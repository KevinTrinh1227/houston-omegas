'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  message: string;
  action?: { label: string; onClick: () => void };
  icon?: ReactNode;
}

export default function EmptyState({ message, action, icon }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
      {icon && <div className="mb-3 text-gray-300 flex justify-center">{icon}</div>}
      <p className="text-gray-400 text-sm">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
