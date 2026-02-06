import type { Env } from '../../types';
import { EXEC_ROLES, ALL_ROLES } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

// GET: Auth - get member details
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;

    const member = await context.env.DB.prepare(
      `SELECT id, email, first_name, last_name, role, phone, class_year, major, instagram,
              avatar_url, is_active, created_at, updated_at, last_login_at
       FROM members WHERE id = ?`
    ).bind(id).first();

    if (!member) return error('Member not found', 404);

    return json(member);
  } catch {
    return error('Internal server error', 500);
  }
};

// PUT: Self or exec - update member
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;
    const isSelf = id === result.auth.member.id;
    const isExec = EXEC_ROLES.includes(result.auth.member.role);

    if (!isSelf && !isExec) return error('Forbidden', 403);

    const body = await context.request.json() as Record<string, string | number | boolean>;

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    // Everyone can update their own profile fields
    if (body.first_name !== undefined) { fields.push('first_name = ?'); values.push(sanitize(body.first_name as string)); }
    if (body.last_name !== undefined) { fields.push('last_name = ?'); values.push(sanitize(body.last_name as string)); }
    if (body.phone !== undefined) { fields.push('phone = ?'); values.push(sanitize(body.phone as string) || null); }
    if (body.class_year !== undefined) { fields.push('class_year = ?'); values.push(sanitize(body.class_year as string) || null); }
    if (body.major !== undefined) { fields.push('major = ?'); values.push(sanitize(body.major as string) || null); }
    if (body.instagram !== undefined) { fields.push('instagram = ?'); values.push(sanitize(body.instagram as string) || null); }

    // Only exec can change role and active status
    if (isExec && !isSelf) {
      if (body.role !== undefined) {
        if (!ALL_ROLES.includes(body.role as typeof ALL_ROLES[number])) return error('Invalid role');
        fields.push('role = ?');
        values.push(body.role as string);
      }
      if (body.is_active !== undefined) {
        fields.push('is_active = ?');
        values.push(body.is_active ? 1 : 0);
      }
    }

    if (fields.length === 0) return error('No fields to update');

    fields.push("updated_at = datetime('now')");
    values.push(id);

    const updated = await context.env.DB.prepare(
      `UPDATE members SET ${fields.join(', ')} WHERE id = ? RETURNING id, email, first_name, last_name, role, phone, class_year, major, instagram, avatar_url, is_active, created_at, updated_at`
    ).bind(...values).first();

    if (!updated) return error('Member not found', 404);

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'update_member', 'member', id, body, ip);

    return json(updated);
  } catch {
    return error('Internal server error', 500);
  }
};

// DELETE: Exec only - deactivate member
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;

    // Can't deactivate yourself
    if (id === result.auth.member.id) return error('Cannot deactivate yourself');

    const existing = await context.env.DB.prepare(
      `SELECT id FROM members WHERE id = ?`
    ).bind(id).first();

    if (!existing) return error('Member not found', 404);

    // Deactivate (don't delete)
    await context.env.DB.prepare(
      `UPDATE members SET is_active = 0, role = 'inactive', updated_at = datetime('now') WHERE id = ?`
    ).bind(id).run();

    // Delete all sessions for this member
    await context.env.DB.prepare(
      `DELETE FROM sessions WHERE member_id = ?`
    ).bind(id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'deactivate_member', 'member', id, null, ip);

    return json({ success: true });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
