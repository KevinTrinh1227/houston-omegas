import type { Env } from '../../types';
import { requireAuth, generateId, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

// POST: Bulk mark attendance
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, ['admin', 'president', 'secretary']);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as { event_id: string; records: { member_id: string; status: string; excuse_reason?: string }[] };
    const event_id = sanitize(body.event_id);
    if (!event_id || !Array.isArray(body.records)) return error('event_id and records array are required');

    const validStatuses = ['present', 'absent', 'excused', 'late'];
    let updated = 0;

    for (const rec of body.records) {
      if (!validStatuses.includes(rec.status)) continue;

      const existing = await context.env.DB.prepare(
        `SELECT id FROM attendance WHERE event_id = ? AND member_id = ?`
      ).bind(event_id, rec.member_id).first();

      if (existing) {
        await context.env.DB.prepare(
          `UPDATE attendance SET status = ?, marked_by = ?, excuse_reason = ?, check_in_at = CASE WHEN ? IN ('present','late') THEN datetime('now') ELSE check_in_at END, updated_at = datetime('now') WHERE id = ?`
        ).bind(rec.status, result.auth.member.id, rec.excuse_reason || null, rec.status, existing.id).run();
      } else {
        const id = generateId();
        await context.env.DB.prepare(
          `INSERT INTO attendance (id, event_id, member_id, status, marked_by, excuse_reason, check_in_at) VALUES (?, ?, ?, ?, ?, ?, CASE WHEN ? IN ('present','late') THEN datetime('now') ELSE NULL END)`
        ).bind(id, event_id, rec.member_id, rec.status, result.auth.member.id, rec.excuse_reason || null, rec.status).run();
      }
      updated++;
    }

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'mark_attendance', 'event', event_id, { updated }, ip);

    return json({ updated });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
