'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  const btnBase =
    'text-[11px] uppercase tracking-[0.15em] font-semibold px-3 py-1.5 rounded-lg transition-all';

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={`${btnBase} text-dash-text-secondary border border-dash-border hover:border-dash-text-muted disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        Prev
      </button>

      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-xs text-dash-text-muted">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`${btnBase} ${
              p === page
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'text-dash-text-secondary border border-dash-border hover:border-dash-text-muted'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={`${btnBase} text-dash-text-secondary border border-dash-border hover:border-dash-text-muted disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        Next
      </button>
    </div>
  );
}
