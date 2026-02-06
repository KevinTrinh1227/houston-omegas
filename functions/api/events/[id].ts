import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;

    const event = await context.env.DB.prepare(
      `SELECT e.*, m.first_name as creator_first, m.last_name as creator_last
       FROM events e JOIN members m ON e.created_by = m.id WHERE e.id = ?`
    ).bind(id).first();

    if (!event) return error('Event not found', 404);

    // Get attendance for this event
    const attendance = await context.env.DB.prepare(
      `SELECT a.*, m.first_name, m.last_name, m.email
       FROM attendance a JOIN members m ON a.member_id = m.id
       WHERE a.event_id = ? ORDER BY m.last_name, m.first_name`
    ).bind(id).all();

    return json({ ...event, attendance: attendance.results });
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

    if (body.title !== undefined) { fields.push('title = ?'); values.push(sanitize(body.title as string)); }
    if (body.description !== undefined) { fields.push('description = ?'); values.push(sanitize(body.description as string) || null); }
    if (body.event_type !== undefined) { fields.push('event_type = ?'); values.push(sanitize(body.event_type as string)); }
    if (body.location !== undefined) { fields.push('location = ?'); values.push(sanitize(body.location as string) || null); }
    if (body.start_time !== undefined) { fields.push('start_time = ?'); values.push(sanitize(body.start_time as string)); }
    if (body.end_time !== undefined) { fields.push('end_time = ?'); values.push(sanitize(body.end_time as string) || null); }
    if (body.is_mandatory !== undefined) { fields.push('is_mandatory = ?'); values.push(body.is_mandatory ? 1 : 0); }
    if (body.points_value !== undefined) { fields.push('points_value = ?'); values.push(Number(body.points_value) || 0); }

    if (fields.length === 0) return error('No fields to update');

    fields.push("updated_at = datetime('now')");
    values.push(id);

    const updated = await context.env.DB.prepare(
      `UPDATE events SET ${fields.join(', ')} WHERE id = ? RETURNING *`
    ).bind(...values).first();

    if (!updated) return error('Event not found', 404);

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'update_event', 'event', id, body, ip);

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
    await context.env.DB.prepare(`DELETE FROM events WHERE id = ?`).bind(id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'delete_event', 'event', id, null, ip);

    return json({ success: true });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
