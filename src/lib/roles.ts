export type Role = 'admin' | 'president' | 'vpi' | 'vpx' | 'treasurer' | 'secretary' | 'junior_active' | 'active' | 'alumni' | 'inactive';

export type ChairPosition = 'recruitment' | 'alumni' | 'social' | 'social_media' | 'brotherhood' | 'historian' | null;

export const EXEC_ROLES: Role[] = ['admin', 'president', 'vpi', 'vpx', 'treasurer', 'secretary'];

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  president: 'President',
  vpi: 'VP Internal',
  vpx: 'VP External',
  treasurer: 'Treasurer',
  secretary: 'Secretary',
  junior_active: 'J.A.',
  active: 'Active',
  alumni: 'Alumni',
  inactive: 'Inactive',
};

export const ROLE_COLORS: Record<Role, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-400',
  president: 'bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-400',
  vpi: 'bg-violet-100 text-violet-700 dark:bg-violet-900/80 dark:text-violet-400',
  vpx: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/80 dark:text-indigo-400',
  treasurer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-400',
  secretary: 'bg-sky-100 text-sky-700 dark:bg-sky-900/80 dark:text-sky-400',
  junior_active: 'bg-teal-100 text-teal-700 dark:bg-teal-900/80 dark:text-teal-400',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/80 dark:text-green-400',
  alumni: 'bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-400',
  inactive: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
};

export const CHAIR_LABELS: Record<string, string> = {
  recruitment: 'Recruitment Chair',
  alumni: 'Alumni Chair',
  social: 'Social Chair',
  social_media: 'Social Media Chair',
  brotherhood: 'Brotherhood Chair',
  historian: 'Historian',
};

export const CHAIR_COLORS: Record<string, string> = {
  recruitment: 'bg-purple-100 text-purple-700 dark:bg-purple-900/80 dark:text-purple-400',
  alumni: 'bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-400',
  social: 'bg-orange-100 text-orange-700 dark:bg-orange-900/80 dark:text-orange-400',
  social_media: 'bg-pink-100 text-pink-700 dark:bg-pink-900/80 dark:text-pink-400',
  brotherhood: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-400',
  historian: 'bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-400',
};

// Pages that chairs can access (beyond the shared pages everyone gets)
export const CHAIR_PAGE_ACCESS: Record<string, string[]> = {
  recruitment: ['/dashboard/recruitment'],
  alumni: ['/dashboard/alumni'],
  social: ['/dashboard/events'],
  social_media: ['/dashboard/analytics', '/dashboard/blog'],
  brotherhood: ['/dashboard/points'],
  historian: ['/dashboard/historian', '/dashboard/meetings'],
};

// Pages every authenticated member can access
const SHARED_PAGES = [
  '/dashboard',
  '/dashboard/calendar',
  '/dashboard/wiki',
  '/dashboard/blog',
  '/dashboard/files',
  '/dashboard/settings',
];

// Pages only exec can access
const EXEC_PAGES = [
  '/dashboard/members',
  '/dashboard/finance',
  '/dashboard/meetings',
  '/dashboard/submissions',
  '/dashboard/partners',
  '/dashboard/announcements',
  '/dashboard/attendance',
];

export function isExecRole(role: string): boolean {
  return EXEC_ROLES.includes(role as Role);
}

export function isChairHolder(chairPosition: string | null | undefined): boolean {
  return !!chairPosition && chairPosition in CHAIR_PAGE_ACCESS;
}

export function canAccessPage(role: string, chairPosition: string | null | undefined, page: string): boolean {
  // Shared pages — everyone can access
  if (SHARED_PAGES.some(p => page === p || (p !== '/dashboard' && page.startsWith(p + '/')))) {
    return true;
  }

  // Exec can access everything
  if (isExecRole(role)) return true;

  // Check chair position access
  if (chairPosition && CHAIR_PAGE_ACCESS[chairPosition]) {
    const allowed = CHAIR_PAGE_ACCESS[chairPosition];
    if (allowed.some(p => page === p || page.startsWith(p + '/'))) {
      return true;
    }
  }

  // Check exec-only pages
  if (EXEC_PAGES.some(p => page === p || page.startsWith(p + '/'))) {
    return false;
  }

  // Default allow for any unrecognized pages (new blog post, etc.)
  return true;
}
