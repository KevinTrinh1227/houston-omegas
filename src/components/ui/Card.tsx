'use client';

import { ReactNode } from 'react';

interface CardProps {
  className?: string;
  padding?: string;
  children: ReactNode;
}

export default function Card({ className = '', padding = 'p-5', children }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${padding} ${className}`}>
      {children}
    </div>
  );
}
