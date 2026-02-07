import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;

    const prospect = await context.env.DB.prepare(
      `SELECT p.*, m.first_name as creator_first, m.last_name as creator_last
       FROM prospects p JOIN members m ON p.created_by = m.id WHERE p.id = ?`
    ).bind(id).first();

    if (!prospect) return error('Prospect not found', 404);

    return json(prospect);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;
    const body = await context.request.json() as Record<string, unknown>;

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (body.first_name !== undefined) { fields.push('first_name = ?'); values.push(sanitize(body.first_name as string)); }
    if (body.last_name !== undefined) { fields.push('last_name = ?'); values.push(sanitize(body.last_name as string)); }
    if (body.email !== undefined) { fields.push('email = ?'); values.push(sanitize(body.email as string) || null); }
    if (body.phone !== undefined) { fields.push('phone = ?'); values.push(sanitize(body.phone as string) || null); }
    if (body.instagram !== undefined) { fields.push('instagram = ?'); values.push(sanitize(body.instagram as string) || null); }
    if (body.age !== undefined) { fields.push('age = ?'); values.push(body.age !== null ? Number(body.age) : null); }
    if (body.major !== undefined) { fields.push('major = ?'); values.push(sanitize(body.major as string) || null); }
    if (body.is_uh_student !== undefined) { fields.push('is_uh_student = ?'); values.push(body.is_uh_student ? 1 : 0); }
    if (body.status !== undefined) { fields.push('status = ?'); values.push(sanitize(body.status as string)); }
    if (body.notes !== undefined) { fields.push('notes = ?'); values.push(sanitize(body.notes as string) || null); }
    if (body.assigned_members !== undefined) {
      fields.push('assigned_members = ?');
      values.push(Array.isArray(body.assigned_members) ? JSON.stringify(body.assigned_members) : '[]');
    }

    if (fields.length === 0) return error('No fields to update');

    fields.push("updated_at = datetime('now')");
    values.push(id);

    const updated = await context.env.DB.prepare(
      `UPDATE prospects SET ${fields.join(', ')} WHERE id = ? RETURNING *`
    ).bind(...values).first();

    if (!updated) return error('Prospect not found', 404);

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'update_prospect', 'prospect', id, body, ip);

    return json(updated);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;
    await context.env.DB.prepare(`DELETE FROM prospects WHERE id = ?`).bind(id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'delete_prospect', 'prospect', id, null, ip);

    return json({ success: true });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
