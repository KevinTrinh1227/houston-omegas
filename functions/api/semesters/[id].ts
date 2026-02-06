import type { Env } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, ['admin', 'president', 'treasurer']);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;
    const body = await context.request.json() as Record<string, unknown>;

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (body.name !== undefined) { fields.push('name = ?'); values.push(sanitize(body.name as string)); }
    if (body.start_date !== undefined) { fields.push('start_date = ?'); values.push(sanitize(body.start_date as string)); }
    if (body.end_date !== undefined) { fields.push('end_date = ?'); values.push(sanitize(body.end_date as string)); }
    if (body.dues_amount !== undefined) { fields.push('dues_amount = ?'); values.push(Number(body.dues_amount) || 0); }
    if (body.is_current !== undefined) {
      if (body.is_current) {
        await context.env.DB.prepare(`UPDATE semesters SET is_current = 0`).run();
      }
      fields.push('is_current = ?');
      values.push(body.is_current ? 1 : 0);
    }

    if (fields.length === 0) return error('No fields to update');

    values.push(id);
    const updated = await context.env.DB.prepare(
      `UPDATE semesters SET ${fields.join(', ')} WHERE id = ? RETURNING *`
    ).bind(...values).first();

    if (!updated) return error('Semester not found', 404);

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'update_semester', 'semester', id, body, ip);

    return json(updated);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
