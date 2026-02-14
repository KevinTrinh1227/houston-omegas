'use client';

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'list' | 'profile' | 'stats' | 'text';
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ type = 'card', count = 1, className = '' }: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  switch (type) {
    case 'stats':
      return (
        <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
          {items.map((i) => (
            <div key={i} className="bg-dash-card rounded-xl border border-dash-border p-5 animate-pulse">
              <div className="h-4 bg-dash-badge-bg rounded w-24 mb-3" />
              <div className="h-8 bg-dash-badge-bg rounded w-16" />
            </div>
          ))}
        </div>
      );

    case 'table':
      return (
        <div className={`bg-dash-card rounded-xl border border-dash-border overflow-hidden ${className}`}>
          <div className="divide-y divide-dash-border">
            {items.map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-dash-badge-bg shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-dash-badge-bg rounded w-1/3 mb-2" />
                  <div className="h-3 bg-dash-badge-bg rounded w-1/4" />
                </div>
                <div className="h-6 bg-dash-badge-bg rounded w-20" />
              </div>
            ))}
          </div>
        </div>
      );

    case 'list':
      return (
        <div className={`space-y-3 ${className}`}>
          {items.map((i) => (
            <div key={i} className="bg-dash-card rounded-lg border border-dash-border p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-dash-badge-bg" />
                <div className="flex-1">
                  <div className="h-4 bg-dash-badge-bg rounded w-2/3 mb-1.5" />
                  <div className="h-3 bg-dash-badge-bg rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case 'profile':
      return (
        <div className={`bg-dash-card rounded-xl border border-dash-border p-6 animate-pulse ${className}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-dash-badge-bg" />
            <div className="flex-1">
              <div className="h-5 bg-dash-badge-bg rounded w-40 mb-2" />
              <div className="h-4 bg-dash-badge-bg rounded w-28" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="h-3 bg-dash-badge-bg rounded w-20 mb-2" />
              <div className="h-4 bg-dash-badge-bg rounded w-48" />
            </div>
            <div>
              <div className="h-3 bg-dash-badge-bg rounded w-16 mb-2" />
              <div className="h-4 bg-dash-badge-bg rounded w-32" />
            </div>
          </div>
        </div>
      );

    case 'text':
      return (
        <div className={`space-y-2 animate-pulse ${className}`}>
          {items.map((i) => (
            <div key={i} className="h-4 bg-dash-badge-bg rounded" style={{ width: `${80 - i * 10}%` }} />
          ))}
        </div>
      );

    case 'card':
    default:
      return (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
          {items.map((i) => (
            <div key={i} className="bg-dash-card rounded-xl border border-dash-border p-6 animate-pulse">
              <div className="h-6 bg-dash-badge-bg rounded w-32 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-dash-badge-bg rounded" />
                <div className="h-4 bg-dash-badge-bg rounded w-5/6" />
                <div className="h-4 bg-dash-badge-bg rounded w-4/6" />
              </div>
            </div>
          ))}
        </div>
      );
  }
}

export function SkeletonCircle({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-16 h-16' };
  return <div className={`${sizeClasses[size]} rounded-full bg-dash-badge-bg animate-pulse ${className}`} />;
}

export function SkeletonLine({ width = 'full', height = 'md', className = '' }: { width?: string; height?: 'sm' | 'md' | 'lg'; className?: string }) {
  const heightClasses = { sm: 'h-3', md: 'h-4', lg: 'h-6' };
  return (
    <div
      className={`${heightClasses[height]} bg-dash-badge-bg rounded animate-pulse ${className}`}
      style={{ width: width === 'full' ? '100%' : width }}
    />
  );
}

export default LoadingSkeleton;
