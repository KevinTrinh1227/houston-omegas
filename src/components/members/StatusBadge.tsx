'use client';

import { STATUS_COLORS } from '@/lib/member-types';

interface StatusBadgeProps {
  status: 'active' | 'inactive';
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusBadge({ status, size = 'sm', className = '' }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium uppercase ${sizeClasses} ${STATUS_COLORS[status]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
      {status}
    </span>
  );
}
