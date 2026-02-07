'use client';

import { ReactNode } from 'react';

interface BadgeProps {
  color?: string;
  className?: string;
  children: ReactNode;
}

export default function Badge({
  color = 'bg-dash-badge-bg text-dash-text-secondary',
  className = '',
  children,
}: BadgeProps) {
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${color} ${className}`}
    >
      {children}
    </span>
  );
}
