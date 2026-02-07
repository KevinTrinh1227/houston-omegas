import useSWR from 'swr';
import { fetcher } from './fetcher';

// Reusable SWR config for dashboard data
const swrConfig = {
  revalidateOnFocus: false,
  dedupingInterval: 5000,
};

// ─── Members ───
export interface MemberSummary {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string | null;
  class_year: string | null;
  major: string | null;
  instagram: string | null;
  avatar_url: string | null;
  is_active: number;
  created_at: string;
  last_login_at: string | null;
}

export function useMembers() {
  return useSWR<MemberSummary[]>('/api/members', fetcher, swrConfig);
}

// ─── Dashboard Stats ───
export interface DashboardStats {
  total_members: number;
  active_members: number;
  published_posts: number;
  recruitment_submissions: number;
  inquiry_submissions: number;
  active_announcements: number;
}

export function useDashboardStats() {
  return useSWR<DashboardStats>('/api/dashboard/stats', fetcher, swrConfig);
}

// ─── Analytics ───
export interface AnalyticsData {
  active_users_7d: number;
  active_users_30d: number;
  total_members: number;
  active_members: number;
  dues_collection_rate: number;
  dues_total_due: number;
  dues_total_paid: number;
  attendance_avg: number;
  total_points: number;
  total_events: number;
  total_meetings: number;
  total_documents: number;
  recent_activity: { action: string; page: string | null; count: number }[];
}

export function useAnalytics() {
  return useSWR<AnalyticsData>('/api/dashboard/analytics', fetcher, swrConfig);
}

// ─── Semesters ───
export interface Semester {
  id: string;
  name: string;
  is_current: number;
}

export function useSemesters() {
  return useSWR<Semester[]>('/api/semesters', fetcher, swrConfig);
}

// ─── Blog Posts ───
export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  status: string;
  published_at: string | null;
  views: number;
  created_at: string;
  first_name: string;
  last_name: string;
  author_id: string;
}

export function useBlogPosts() {
  return useSWR<{ posts: BlogPost[] } | BlogPost[]>('/api/dashboard/blog-posts', fetcher, swrConfig);
}

// ─── Announcements ───
export interface Announcement {
  id: number;
  title: string;
  body: string;
  type: string;
  priority: string;
  link_url: string | null;
  link_text: string | null;
  is_active: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export function useAnnouncements() {
  return useSWR<Announcement[]>('/api/announcements', fetcher, swrConfig);
}

// ─── Events ───
export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  semester_id: string;
  created_by: string;
  created_at: string;
}

export function useEvents(semesterId?: string) {
  return useSWR<Event[]>(
    semesterId ? `/api/events?semester_id=${semesterId}` : '/api/events',
    fetcher, swrConfig
  );
}

// ─── Config ───
export function useConfig() {
  return useSWR<Record<string, string>>('/api/config', fetcher, swrConfig);
}

// ─── Social Accounts ───
export interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  url: string | null;
  is_active: number;
  created_at: string;
}

export interface SocialMetric {
  id: string;
  account_id: string;
  recorded_date: string;
  followers: number;
  following: number;
  posts_count: number;
  likes: number;
  comments: number;
  views: number;
  notes: string | null;
  recorded_by: string;
  created_at: string;
}

export function useSocialAccounts() {
  return useSWR<SocialAccount[]>('/api/social/accounts', fetcher, swrConfig);
}

export function useSocialMetrics(accountId?: string) {
  return useSWR<SocialMetric[]>(
    accountId ? `/api/social/metrics?account_id=${accountId}` : null,
    fetcher, swrConfig
  );
}

// ─── Wiki ───
export interface WikiPage {
  id: string;
  slug: string;
  title: string;
  body: string;
  category: string;
  role_tag: string | null;
  sort_order: number;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useWikiPages() {
  return useSWR<WikiPage[]>('/api/wiki', fetcher, swrConfig);
}

export function useWikiPage(slug?: string) {
  return useSWR<WikiPage>(
    slug ? `/api/wiki/${slug}` : null,
    fetcher, swrConfig
  );
}

// ─── Media ───
export interface MediaFile {
  id: string;
  filename: string;
  r2_key: string;
  content_type: string;
  size_bytes: number;
  category: string;
  description: string | null;
  uploaded_by: string;
  uploader_first_name?: string;
  uploader_last_name?: string;
  created_at: string;
}

export function useMediaFiles(category?: string) {
  const params = category && category !== 'all' ? `?category=${category}` : '';
  return useSWR<MediaFile[]>(`/api/media${params}`, fetcher, swrConfig);
}
