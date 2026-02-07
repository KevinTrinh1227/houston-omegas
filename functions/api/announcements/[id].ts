import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

// PUT: Exec only - update announcement
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;
    const body = await context.request.json() as Record<string, string | boolean | number>;

    const existing = await context.env.DB.prepare(
      `SELECT id FROM announcements WHERE id = ?`
    ).bind(id).first();

    if (!existing) return error('Announcement not found', 404);

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (body.title !== undefined) { fields.push('title = ?'); values.push(sanitize(body.title as string)); }
    if (body.body !== undefined) { fields.push('body = ?'); values.push(sanitize(body.body as string)); }
    if (body.type !== undefined) { fields.push('type = ?'); values.push(body.type as string); }
    if (body.priority !== undefined) { fields.push('priority = ?'); values.push(body.priority as string); }
    if (body.link_url !== undefined) { fields.push('link_url = ?'); values.push(sanitize(body.link_url as string) || null); }
    if (body.link_text !== undefined) { fields.push('link_text = ?'); values.push(sanitize(body.link_text as string) || null); }
    if (body.is_active !== undefined) { fields.push('is_active = ?'); values.push(body.is_active ? 1 : 0); }
    if (body.starts_at !== undefined) { fields.push('starts_at = ?'); values.push(body.starts_at as string || null); }
    if (body.ends_at !== undefined) { fields.push('ends_at = ?'); values.push(body.ends_at as string || null); }
    if (body.image_url !== undefined) { fields.push('image_url = ?'); values.push(sanitize(body.image_url as string) || null); }
    if (body.target_pages !== undefined) { fields.push('target_pages = ?'); values.push(body.target_pages as string || '[]'); }

    if (fields.length === 0) return error('No fields to update');

    fields.push("updated_at = datetime('now')");
    values.push(id);

    const updated = await context.env.DB.prepare(
      `UPDATE announcements SET ${fields.join(', ')} WHERE id = ? RETURNING *`
    ).bind(...values).first();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'update_announcement', 'announcement', id, body, ip);

    return json(updated);
  } catch {
    return error('Internal server error', 500);
  }
};

// DELETE: Exec only - delete announcement
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;

    const existing = await context.env.DB.prepare(
      `SELECT id FROM announcements WHERE id = ?`
    ).bind(id).first();

    if (!existing) return error('Announcement not found', 404);

    await context.env.DB.prepare(`DELETE FROM announcements WHERE id = ?`).bind(id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'delete_announcement', 'announcement', id, null, ip);

    return json({ success: true });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
