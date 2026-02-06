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
    const isExec = EXEC_ROLES.includes(result.auth.member.role);

    const meeting = await context.env.DB.prepare(
      `SELECT mt.*, m.first_name as creator_first, m.last_name as creator_last
       FROM meetings mt JOIN members m ON mt.created_by = m.id WHERE mt.id = ?`
    ).bind(id).first();

    if (!meeting) return error('Meeting not found', 404);
    if (meeting.meeting_type === 'exec' && !isExec) return error('Forbidden', 403);

    const [actionItems, attachments] = await Promise.all([
      context.env.DB.prepare(
        `SELECT ai.*, m.first_name as assigned_first, m.last_name as assigned_last
         FROM action_items ai LEFT JOIN members m ON ai.assigned_to = m.id
         WHERE ai.meeting_id = ? ORDER BY ai.created_at`
      ).bind(id).all(),
      context.env.DB.prepare(
        `SELECT ma.*, m.first_name as uploader_first, m.last_name as uploader_last
         FROM meeting_attachments ma JOIN members m ON ma.uploaded_by = m.id
         WHERE ma.meeting_id = ? ORDER BY ma.created_at`
      ).bind(id).all(),
    ]);

    return json({ ...meeting, action_items: actionItems.results, attachments: attachments.results });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, ['admin', 'president', 'secretary']);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;
    const body = await context.request.json() as Record<string, unknown>;

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (body.title !== undefined) { fields.push('title = ?'); values.push(sanitize(body.title as string)); }
    if (body.meeting_type !== undefined) { fields.push('meeting_type = ?'); values.push(sanitize(body.meeting_type as string)); }
    if (body.meeting_date !== undefined) { fields.push('meeting_date = ?'); values.push(sanitize(body.meeting_date as string)); }
    if (body.notes !== undefined) { fields.push('notes = ?'); values.push(body.notes as string || null); }

    if (fields.length === 0) return error('No fields to update');

    fields.push("updated_at = datetime('now')");
    values.push(id);

    const updated = await context.env.DB.prepare(
      `UPDATE meetings SET ${fields.join(', ')} WHERE id = ? RETURNING *`
    ).bind(...values).first();

    if (!updated) return error('Meeting not found', 404);

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'update_meeting', 'meeting', id, body, ip);

    return json(updated);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, ['admin', 'president', 'secretary']);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;
    await context.env.DB.prepare(`DELETE FROM meetings WHERE id = ?`).bind(id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'delete_meeting', 'meeting', id, null, ip);

    return json({ success: true });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
