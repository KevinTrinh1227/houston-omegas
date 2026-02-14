'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  href?: string;
  icon?: React.ReactNode;
  svgPath?: string;
  change?: {
    value: number;
    label?: string;
  };
  className?: string;
}

export function StatCard({ label, value, href, icon, svgPath, change, className = '' }: StatCardProps) {
  const content = (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-dash-text-secondary uppercase tracking-wider font-medium">{label}</span>
        {icon ? (
          <span className="text-dash-text-muted">{icon}</span>
        ) : svgPath ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-dash-text-muted">
            <path d={svgPath} />
          </svg>
        ) : null}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold text-dash-text">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${change.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {change.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{change.value >= 0 ? '+' : ''}{change.value}%</span>
              {change.label && <span className="text-dash-text-muted ml-1">{change.label}</span>}
            </div>
          )}
        </div>
        {href && <ArrowRight size={14} className="text-dash-text-muted opacity-0 group-hover:opacity-100 transition-opacity mb-1" />}
      </div>
    </>
  );

  const baseClasses = `bg-dash-card rounded-xl border border-dash-border p-5 ${className}`;

  if (href) {
    return (
      <Link href={href} className={`${baseClasses} hover:border-dash-text-muted/30 transition-colors group`}>
        {content}
      </Link>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}

interface StatCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function StatCardGrid({ children, columns = 3 }: StatCardGridProps) {
  const colClass = columns === 2 ? 'lg:grid-cols-2' : columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3';
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-2 ${colClass} gap-4`}>
      {children}
    </div>
  );
}
