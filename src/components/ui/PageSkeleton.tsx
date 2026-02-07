'use client';

interface PageSkeletonProps {
  rows?: number;
  variant?: 'cards' | 'table' | 'list';
}

function SkeletonBar({ width = 'w-full' }: { width?: string }) {
  return <div className={`h-3 bg-dash-badge-bg rounded ${width}`} />;
}

function CardsSkeleton({ rows }: { rows: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-dash-card rounded-xl border border-dash-border p-5 animate-pulse">
          <SkeletonBar width="w-24" />
          <div className="mt-3">
            <SkeletonBar width="w-16" />
          </div>
          <div className="mt-2">
            <SkeletonBar width="w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="bg-dash-card rounded-xl border border-dash-border overflow-hidden animate-pulse">
      <div className="border-b border-dash-border px-5 py-3 flex gap-8">
        <SkeletonBar width="w-24" />
        <SkeletonBar width="w-32" />
        <SkeletonBar width="w-20" />
        <SkeletonBar width="w-24" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-dash-border/50 px-5 py-3.5 flex gap-8">
          <SkeletonBar width="w-28" />
          <SkeletonBar width="w-36" />
          <SkeletonBar width="w-16" />
          <SkeletonBar width="w-20" />
        </div>
      ))}
    </div>
  );
}

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-dash-card rounded-xl border border-dash-border p-5 animate-pulse">
          <SkeletonBar width="w-48" />
          <div className="mt-2">
            <SkeletonBar width="w-72" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PageSkeleton({ rows = 3, variant = 'list' }: PageSkeletonProps) {
  switch (variant) {
    case 'cards':
      return <CardsSkeleton rows={rows} />;
    case 'table':
      return <TableSkeleton rows={rows} />;
    case 'list':
    default:
      return <ListSkeleton rows={rows} />;
  }
}
