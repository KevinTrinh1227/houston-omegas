import type { Env } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;
    const body = await context.request.json() as Record<string, unknown>;

    // Check if user is assigned or is secretary/admin
    const item = await context.env.DB.prepare(`SELECT * FROM action_items WHERE id = ?`).bind(id).first();
    if (!item) return error('Action item not found', 404);

    const canEdit = item.assigned_to === result.auth.member.id ||
      ['admin', 'president', 'secretary'].includes(result.auth.member.role);
    if (!canEdit) return error('Forbidden', 403);

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (body.status !== undefined) {
      const valid = ['open', 'in_progress', 'completed'];
      if (!valid.includes(body.status as string)) return error('Invalid status');
      fields.push('status = ?');
      values.push(body.status as string);
      if (body.status === 'completed') fields.push("completed_at = datetime('now')");
    }
    if (body.description !== undefined) { fields.push('description = ?'); values.push(sanitize(body.description as string)); }
    if (body.assigned_to !== undefined) { fields.push('assigned_to = ?'); values.push(sanitize(body.assigned_to as string) || null); }
    if (body.due_date !== undefined) { fields.push('due_date = ?'); values.push(sanitize(body.due_date as string) || null); }

    if (fields.length === 0) return error('No fields to update');

    fields.push("updated_at = datetime('now')");
    values.push(id);

    const updated = await context.env.DB.prepare(
      `UPDATE action_items SET ${fields.join(', ')} WHERE id = ? RETURNING *`
    ).bind(...values).first();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'update_action_item', 'action_item', id, body, ip);

    return json(updated);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
