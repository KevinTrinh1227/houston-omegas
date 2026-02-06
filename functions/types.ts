export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  DISCORD_WEBHOOK_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
}

export type Role = 'admin' | 'president' | 'vpi' | 'vpx' | 'treasurer' | 'secretary' | 'active' | 'alumni' | 'inactive';

export const EXEC_ROLES: Role[] = ['admin', 'president', 'vpi', 'vpx', 'treasurer', 'secretary'];
export const ALL_ROLES: Role[] = ['admin', 'president', 'vpi', 'vpx', 'treasurer', 'secretary', 'active', 'alumni', 'inactive'];

export interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  phone: string | null;
  class_year: string | null;
  major: string | null;
  instagram: string | null;
  avatar_url: string | null;
  invited_by: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface Session {
  id: string;
  member_id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  expires_at: string;
  last_active_at: string;
}

export interface AuthenticatedContext {
  member: Member;
  session: Session;
}
