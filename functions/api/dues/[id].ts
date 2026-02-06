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

    if (body.status !== undefined) {
      const valid = ['unpaid', 'partial', 'paid', 'waived', 'exempt'];
      if (!valid.includes(body.status as string)) return error('Invalid status');
      fields.push('status = ?');
      values.push(body.status as string);
    }
    if (body.amount_due !== undefined) { fields.push('amount_due = ?'); values.push(Number(body.amount_due)); }
    if (body.notes !== undefined) { fields.push('notes = ?'); values.push(sanitize(body.notes as string) || null); }

    if (fields.length === 0) return error('No fields to update');

    fields.push("updated_at = datetime('now')");
    values.push(id);

    const updated = await context.env.DB.prepare(
      `UPDATE dues SET ${fields.join(', ')} WHERE id = ? RETURNING *`
    ).bind(...values).first();

    if (!updated) return error('Dues record not found', 404);

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'update_dues', 'dues', id, body, ip);

    return json(updated);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
