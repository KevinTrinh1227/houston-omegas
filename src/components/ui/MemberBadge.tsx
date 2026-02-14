'use client';

import { ROLE_LABELS, ROLE_COLORS, CHAIR_LABELS, CHAIR_COLORS, type Role } from '@/lib/roles';

interface MemberBadgeProps {
  role?: string;
  chair?: string;
  eboardPosition?: string | null;
  membershipStatus?: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
}

const EBOARD_LABELS: Record<string, string> = {
  president: 'President',
  vpi: 'VP Internal',
  vpx: 'VP External',
  treasurer: 'Treasurer',
  secretary: 'Secretary',
};

const EBOARD_COLORS: Record<string, string> = {
  president: 'bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-400',
  vpi: 'bg-violet-100 text-violet-700 dark:bg-violet-900/80 dark:text-violet-400',
  vpx: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/80 dark:text-indigo-400',
  treasurer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-400',
  secretary: 'bg-sky-100 text-sky-700 dark:bg-sky-900/80 dark:text-sky-400',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
};

const SIZE_CLASSES = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-2.5 py-1',
};

export function MemberBadge({
  role,
  chair,
  eboardPosition,
  membershipStatus,
  size = 'md',
  showStatus = false,
}: MemberBadgeProps) {
  const sizeClass = SIZE_CLASSES[size];

  return (
    <div className="flex flex-wrap gap-1.5">
      {eboardPosition && EBOARD_LABELS[eboardPosition] && (
        <span
          className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${EBOARD_COLORS[eboardPosition] || ''}`}
        >
          {EBOARD_LABELS[eboardPosition]}
        </span>
      )}

      {role && (!eboardPosition || role === 'admin') && (
        <span
          className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${ROLE_COLORS[role as Role] || 'bg-gray-100 text-gray-600'}`}
        >
          {ROLE_LABELS[role as Role] || role}
        </span>
      )}

      {chair && CHAIR_LABELS[chair] && (
        <span
          className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${CHAIR_COLORS[chair] || 'bg-gray-100 text-gray-600'}`}
        >
          {CHAIR_LABELS[chair]}
        </span>
      )}

      {showStatus && membershipStatus && (
        <span
          className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${STATUS_COLORS[membershipStatus] || ''}`}
        >
          {membershipStatus === 'active' ? 'Active' : 'Inactive'}
        </span>
      )}
    </div>
  );
}

interface MemberBadgeListProps {
  role?: string;
  chairs?: string[];
  eboardPosition?: string | null;
  membershipStatus?: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  maxChairs?: number;
}

export function MemberBadgeList({
  role,
  chairs = [],
  eboardPosition,
  membershipStatus,
  size = 'md',
  showStatus = false,
  maxChairs = 3,
}: MemberBadgeListProps) {
  const sizeClass = SIZE_CLASSES[size];
  const displayChairs = chairs.slice(0, maxChairs);
  const remainingChairs = chairs.length - maxChairs;

  return (
    <div className="flex flex-wrap gap-1.5">
      {eboardPosition && EBOARD_LABELS[eboardPosition] && (
        <span
          className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${EBOARD_COLORS[eboardPosition] || ''}`}
        >
          {EBOARD_LABELS[eboardPosition]}
        </span>
      )}

      {role && (!eboardPosition || role === 'admin') && (
        <span
          className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${ROLE_COLORS[role as Role] || 'bg-gray-100 text-gray-600'}`}
        >
          {ROLE_LABELS[role as Role] || role}
        </span>
      )}

      {displayChairs.map((chair) => (
        <span
          key={chair}
          className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${CHAIR_COLORS[chair] || 'bg-gray-100 text-gray-600'}`}
        >
          {CHAIR_LABELS[chair] || chair}
        </span>
      ))}

      {remainingChairs > 0 && (
        <span
          className={`inline-flex items-center font-medium rounded-full ${sizeClass} bg-dash-badge-bg text-dash-text-muted`}
        >
          +{remainingChairs} more
        </span>
      )}

      {showStatus && membershipStatus && (
        <span
          className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${STATUS_COLORS[membershipStatus] || ''}`}
        >
          {membershipStatus === 'active' ? 'Active' : 'Inactive'}
        </span>
      )}
    </div>
  );
}

export default MemberBadge;
