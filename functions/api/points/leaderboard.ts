import type { Env } from '../../types';
import { requireAuth } from '../../lib/auth';
import { json, error } from '../../lib/response';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const url = new URL(context.request.url);
    const semester_id = url.searchParams.get('semester_id');

    let filter = '';
    const params: string[] = [];
    if (semester_id) { filter = ` WHERE p.semester_id = ?`; params.push(semester_id); }

    const rows = await context.env.DB.prepare(
      `SELECT m.id, m.first_name, m.last_name, m.avatar_url,
              COALESCE(SUM(p.points), 0) as total_points,
              COUNT(p.id) as entries
       FROM members m
       LEFT JOIN points p ON m.id = p.member_id${filter ? ' AND p.semester_id = ?' : ''}
       WHERE m.is_active = 1 AND m.role NOT IN ('inactive', 'alumni')
       GROUP BY m.id
       ORDER BY total_points DESC, m.last_name`
    ).bind(...params).all();

    return json(rows.results);
  } catch {
    return error('Internal server error', 500);
  }
};
