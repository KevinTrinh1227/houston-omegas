import type { Env } from '../../types';
import { EXEC_ROLES, ALL_ROLES } from '../../types';
import { requireAuth, logAudit, generateId } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize, isValidEmail } from '../../lib/validate';
import { notifyNewMember } from '../../lib/notify';

// GET: Auth - list members
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const rows = await context.env.DB.prepare(
      `SELECT id, email, first_name, last_name, role, phone, class_year, major, instagram,
              avatar_url, is_active, created_at, last_login_at
       FROM members ORDER BY
         CASE role WHEN 'admin' THEN 0 WHEN 'president' THEN 1 WHEN 'vpi' THEN 2 WHEN 'vpx' THEN 3 WHEN 'treasurer' THEN 4 WHEN 'secretary' THEN 5 WHEN 'junior_active' THEN 6 WHEN 'active' THEN 7 WHEN 'alumni' THEN 8 ELSE 9 END,
         first_name ASC`
    ).all();

    return json(rows.results);
  } catch {
    return error('Internal server error', 500);
  }
};

// POST: Exec only - invite new member
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as Record<string, string>;
    const email = sanitize(body.email).toLowerCase();
    const firstName = sanitize(body.first_name);
    const lastName = sanitize(body.last_name);
    const role = body.role || 'active';

    if (!email || !isValidEmail(email)) return error('Valid email is required');
    if (!firstName || !lastName) return error('First and last name are required');
    if (!ALL_ROLES.includes(role as typeof ALL_ROLES[number])) return error('Invalid role');

    // Check if email already exists
    const existing = await context.env.DB.prepare(
      `SELECT id FROM members WHERE email = ?`
    ).bind(email).first();

    if (existing) return error('A member with this email already exists');

    const id = generateId();
    const member = await context.env.DB.prepare(
      `INSERT INTO members (id, email, first_name, last_name, role, invited_by, has_completed_onboarding)
       VALUES (?, ?, ?, ?, ?, ?, 0)
       RETURNING *`
    ).bind(id, email, firstName, lastName, role, result.auth.member.id).first();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'invite_member', 'member', id, { email, role }, ip);

    await notifyNewMember(context.env.DISCORD_WEBHOOK_URL, `${firstName} ${lastName}`, role);

    return json(member, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
