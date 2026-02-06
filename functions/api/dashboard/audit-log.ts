import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth } from '../../lib/auth';
import { json, error } from '../../lib/response';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const url = new URL(context.request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
    const offset = (page - 1) * limit;

    const [rows, countResult] = await Promise.all([
      context.env.DB.prepare(
        `SELECT a.*, m.first_name, m.last_name, m.email
         FROM audit_log a
         LEFT JOIN members m ON a.member_id = m.id
         ORDER BY a.created_at DESC
         LIMIT ? OFFSET ?`
      ).bind(limit, offset).all(),
      context.env.DB.prepare(`SELECT COUNT(*) as count FROM audit_log`).first(),
    ]);

    return json({
      entries: rows.results,
      total: countResult?.count ?? 0,
      page,
      limit,
    });
  } catch {
    return error('Internal server error', 500);
  }
};
