'use client';

import { ReactNode } from 'react';

interface CardProps {
  className?: string;
  padding?: string;
  children: ReactNode;
}

export default function Card({ className = '', padding = 'p-5', children }: CardProps) {
  return (
    <div className={`bg-dash-card rounded-xl border border-dash-border ${padding} ${className}`}>
      {children}
    </div>
  );
}
