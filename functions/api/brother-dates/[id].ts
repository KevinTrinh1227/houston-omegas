import type { Env } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, ['admin', 'president', 'vpi']);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;
    const body = await context.request.json() as { approved: boolean; points_awarded?: number };

    const approved = body.approved ? 1 : 0;
    const points_awarded = Number(body.points_awarded) || 0;

    const updated = await context.env.DB.prepare(
      `UPDATE brother_dates SET approved = ?, approved_by = ?, points_awarded = ? WHERE id = ? RETURNING *`
    ).bind(approved, result.auth.member.id, points_awarded, id).first();

    if (!updated) return error('Brother date not found', 404);

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, approved ? 'approve_brother_date' : 'reject_brother_date', 'brother_date', id, { points_awarded }, ip);

    return json(updated);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
