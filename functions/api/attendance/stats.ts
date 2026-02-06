import type { Env } from '../../types';
import { requireAuth } from '../../lib/auth';
import { json, error } from '../../lib/response';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const url = new URL(context.request.url);
    const semester_id = url.searchParams.get('semester_id');

    let eventFilter = '';
    const params: string[] = [];
    if (semester_id) {
      eventFilter = ` AND e.semester_id = ?`;
      params.push(semester_id);
    }

    const rows = await context.env.DB.prepare(
      `SELECT m.id, m.first_name, m.last_name, m.role,
              COUNT(a.id) as total_events,
              SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
              SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
              SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as excused_count,
              SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count
       FROM members m
       LEFT JOIN attendance a ON m.id = a.member_id
       LEFT JOIN events e ON a.event_id = e.id${eventFilter}
       WHERE m.is_active = 1 AND m.role NOT IN ('inactive', 'alumni')
       GROUP BY m.id
       ORDER BY m.last_name, m.first_name`
    ).bind(...params).all();

    return json(rows.results.map((r: Record<string, unknown>) => ({
      ...r,
      attendance_pct: (r.total_events as number) > 0
        ? Math.round(((r.present_count as number) + (r.late_count as number)) / (r.total_events as number) * 100)
        : null,
    })));
  } catch {
    return error('Internal server error', 500);
  }
};
