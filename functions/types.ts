export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  DISCORD_WEBHOOK_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  RESEND_API_KEY: string;
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  TWILIO_MESSAGING_SERVICE_SID: string;
}

export type Role = 'admin' | 'president' | 'vpi' | 'vpx' | 'treasurer' | 'secretary' | 'junior_active' | 'active' | 'alumni' | 'inactive';

export type ChairPosition = 'recruitment' | 'alumni' | 'social' | 'social_media' | 'brotherhood' | 'historian';

export const EXEC_ROLES: Role[] = ['admin', 'president', 'vpi', 'vpx', 'treasurer', 'secretary'];
export const ALL_ROLES: Role[] = ['admin', 'president', 'vpi', 'vpx', 'treasurer', 'secretary', 'junior_active', 'active', 'alumni', 'inactive'];
export const VALID_CHAIR_POSITIONS: ChairPosition[] = ['recruitment', 'alumni', 'social', 'social_media', 'brotherhood', 'historian'];

export interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  chair_position: ChairPosition | null;
  phone: string | null;
  class_year: string | null;
  major: string | null;
  instagram: string | null;
  discord_id: string | null;
  avatar_url: string | null;
  invited_by: string | null;
  phone_verified: number;
  is_active: number;
  has_completed_onboarding: number;
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
