import type { Env, Member, Session, AuthenticatedContext, ChairPosition } from '../types';
import { EXEC_ROLES } from '../types';

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getSessionCookie(token: string, maxAge = 7 * 24 * 60 * 60): string {
  return `session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return 'session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';
}

export function parseSessionToken(request: Request): string | null {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;
  const match = cookie.match(/(?:^|;\s*)session=([a-f0-9]{64})/);
  return match ? match[1] : null;
}

export async function authenticate(
  request: Request,
  db: D1Database
): Promise<AuthenticatedContext | null> {
  const token = parseSessionToken(request);
  if (!token) return null;

  const row = await db.prepare(
    `SELECT s.*, m.id as m_id, m.email, m.first_name, m.last_name, m.role, m.chair_position,
            m.phone, m.class_year, m.major, m.instagram, m.discord_id, m.avatar_url,
            m.invited_by, m.is_active, m.has_completed_onboarding,
            m.created_at as m_created_at, m.updated_at as m_updated_at, m.last_login_at
     FROM sessions s
     JOIN members m ON s.member_id = m.id
     WHERE s.id = ? AND s.expires_at > datetime('now')`
  ).bind(token).first();

  if (!row) return null;
  if (row.is_active !== 1) return null;

  // Update last_active_at
  await db.prepare(
    `UPDATE sessions SET last_active_at = datetime('now') WHERE id = ?`
  ).bind(token).run();

  const member: Member = {
    id: row.m_id as string,
    email: row.email as string,
    first_name: row.first_name as string,
    last_name: row.last_name as string,
    role: row.role as Member['role'],
    chair_position: (row.chair_position as ChairPosition | null) ?? null,
    phone: row.phone as string | null,
    class_year: row.class_year as string | null,
    major: row.major as string | null,
    instagram: row.instagram as string | null,
    discord_id: row.discord_id as string | null,
    avatar_url: row.avatar_url as string | null,
    invited_by: row.invited_by as string | null,
    is_active: row.is_active as number,
    has_completed_onboarding: (row.has_completed_onboarding as number) ?? 1,
    created_at: row.m_created_at as string,
    updated_at: row.m_updated_at as string,
    last_login_at: row.last_login_at as string | null,
  };

  const session: Session = {
    id: row.id as string,
    member_id: row.member_id as string,
    ip_address: row.ip_address as string | null,
    user_agent: row.user_agent as string | null,
    created_at: row.created_at as string,
    expires_at: row.expires_at as string,
    last_active_at: row.last_active_at as string,
  };

  return { member, session };
}

export async function requireAuth(
  request: Request,
  db: D1Database,
  requiredRoles?: Member['role'][]
): Promise<{ auth: AuthenticatedContext; errorResponse?: never } | { auth?: never; errorResponse: Response }> {
  const auth = await authenticate(request, db);
  if (!auth) {
    return {
      errorResponse: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  if (requiredRoles && !requiredRoles.includes(auth.member.role)) {
    return {
      errorResponse: new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  return { auth };
}

export async function logAudit(
  db: D1Database,
  memberId: string | null,
  action: string,
  entityType: string | null,
  entityId: string | null,
  details: unknown,
  ipAddress: string | null
) {
  await db.prepare(
    `INSERT INTO audit_log (member_id, action, entity_type, entity_id, details, ip_address)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(
    memberId,
    action,
    entityType,
    entityId,
    details ? JSON.stringify(details) : null,
    ipAddress
  ).run();
}

export async function requireChairOrExec(
  request: Request,
  db: D1Database,
  allowedChairPositions: ChairPosition[]
): Promise<{ auth: AuthenticatedContext; errorResponse?: never } | { auth?: never; errorResponse: Response }> {
  const auth = await authenticate(request, db);
  if (!auth) {
    return {
      errorResponse: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  // Exec roles always have access
  if (EXEC_ROLES.includes(auth.member.role)) {
    return { auth };
  }

  // Check chair position
  if (auth.member.chair_position && allowedChairPositions.includes(auth.member.chair_position)) {
    return { auth };
  }

  return {
    errorResponse: new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    }),
  };
}

export async function createOAuthSession(
  db: D1Database,
  memberId: string,
  provider: string,
  request: Request,
  redirectTo: string
): Promise<Response> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const ua = request.headers.get('User-Agent') || 'unknown';

  await db.prepare(
    `INSERT INTO sessions (id, member_id, ip_address, user_agent, expires_at)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(token, memberId, ip, ua, expiresAt).run();

  await db.prepare(
    `UPDATE members SET last_login_at = datetime('now') WHERE id = ?`
  ).bind(memberId).run();

  await logAudit(db, memberId, `login_${provider}`, 'member', memberId, { ip, provider }, ip);

  const response = new Response(null, { status: 302 });
  response.headers.set('Location', redirectTo);
  response.headers.append('Set-Cookie', getSessionCookie(token));
  response.headers.append('Set-Cookie', 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
  return response;
}
