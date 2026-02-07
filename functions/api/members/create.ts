import type { Env } from '../../types';
import { requireAuth, generateId, logAudit } from '../../lib/auth';

const EXEC_ROLES = ['admin', 'president', 'vpi', 'vpx', 'treasurer', 'secretary'] as const;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { auth, errorResponse } = await requireAuth(context.request, context.env.DB, [...EXEC_ROLES]);
  if (errorResponse) return errorResponse;

  try {
    const body = await context.request.json() as {
      email?: string; first_name?: string; last_name?: string; role?: string;
      class_year?: string; major?: string; phone?: string; instagram?: string;
    };

    if (!body.email || !body.first_name || !body.last_name) {
      return new Response(JSON.stringify({ error: 'Email, first name, and last name required.' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const email = body.email.toLowerCase().trim();

    // Check if email already exists
    const existing = await context.env.DB.prepare(
      'SELECT id FROM members WHERE email = ?'
    ).bind(email).first();

    if (existing) {
      return new Response(JSON.stringify({ error: 'A member with this email already exists.' }), {
        status: 409, headers: { 'Content-Type': 'application/json' },
      });
    }

    const id = generateId();
    await context.env.DB.prepare(
      `INSERT INTO members (id, email, first_name, last_name, role, class_year, major, phone, instagram, invited_by, is_active, status, has_completed_onboarding)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'pending', 0)`
    ).bind(
      id, email, body.first_name.trim(), body.last_name.trim(),
      body.role || 'active', body.class_year || null, body.major || null,
      body.phone || null, body.instagram || null, auth.member.id
    ).run();

    const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';
    await logAudit(context.env.DB, auth.member.id, 'member_precreate', 'member', id, { email }, ip);

    return new Response(JSON.stringify({ id, status: 'pending' }), {
      status: 201, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to create member.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
