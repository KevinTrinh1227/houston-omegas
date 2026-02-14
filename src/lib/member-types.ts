// Member types for the member management system

export type MemberStatus = 'active' | 'inactive';
export type EboardPosition = 'president' | 'vpi' | 'vpx' | 'treasurer' | 'secretary' | null;
export type SortField = 'name' | 'created_at' | 'role' | 'class_year';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'grid' | 'list';

export interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  chair_position: string | null;
  membership_status: MemberStatus;
  eboard_position: EboardPosition;
  phone: string | null;
  class_year: string | null;
  major: string | null;
  instagram: string | null;
  discord_id: string | null;
  avatar_url: string | null;
  is_active: number;
  created_at: string;
  updated_at?: string;
  last_login_at: string | null;
  chairs?: string[];
}

export interface MemberWithDetails extends Member {
  chairs: string[];
  tags?: string[];
  dues_balance?: number;
  attendance_percentage?: number;
  recent_activity?: ActivityItem[];
}

export interface ActivityItem {
  id: number;
  action_type: string;
  description: string;
  created_at: string;
  entity_type?: string;
  entity_id?: string;
}

export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  eboard: number;
  byClassYear: Record<string, number>;
  byRole: Record<string, number>;
  byChair: Record<string, number>;
  growthData: { month: string; count: number }[];
}

export interface MemberFiltersState {
  status: 'all' | 'active' | 'inactive';
  eboard: 'all' | 'eboard' | 'non-eboard';
  chair: string | 'all';
  classYear: string | 'all';
  search: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export interface SortState {
  field: SortField;
  order: SortOrder;
}

// Available chairs from the database
export interface AvailableChair {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  is_active: number;
}

// Eboard labels and colors
export const EBOARD_LABELS: Record<string, string> = {
  president: 'President',
  vpi: 'VP Internal',
  vpx: 'VP External',
  treasurer: 'Treasurer',
  secretary: 'Secretary',
};

export const EBOARD_COLORS: Record<string, string> = {
  president: 'bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-400',
  vpi: 'bg-violet-100 text-violet-700 dark:bg-violet-900/80 dark:text-violet-400',
  vpx: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/80 dark:text-indigo-400',
  treasurer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-400',
  secretary: 'bg-sky-100 text-sky-700 dark:bg-sky-900/80 dark:text-sky-400',
};

export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/80 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
};

// Chair colors (generic, used when specific chair color not in roles.ts)
export const CHAIR_BADGE_COLORS: Record<string, string> = {
  social: 'bg-orange-100 text-orange-700 dark:bg-orange-900/80 dark:text-orange-400',
  rush: 'bg-purple-100 text-purple-700 dark:bg-purple-900/80 dark:text-purple-400',
  philanthropy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-400',
  historian: 'bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-400',
  marketing: 'bg-pink-100 text-pink-700 dark:bg-pink-900/80 dark:text-pink-400',
  athletics: 'bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-400',
  // Legacy mappings
  recruitment: 'bg-purple-100 text-purple-700 dark:bg-purple-900/80 dark:text-purple-400',
  alumni: 'bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-400',
  social_media: 'bg-pink-100 text-pink-700 dark:bg-pink-900/80 dark:text-pink-400',
  brotherhood: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-400',
};

export function getChairDisplayName(chair: string): string {
  const names: Record<string, string> = {
    social: 'Social Chair',
    rush: 'Rush Chair',
    philanthropy: 'Philanthropy',
    historian: 'Historian',
    marketing: 'Marketing',
    athletics: 'Athletics',
    recruitment: 'Recruitment',
    alumni: 'Alumni Chair',
    social_media: 'Social Media',
    brotherhood: 'Brotherhood',
  };
  return names[chair] || chair.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
