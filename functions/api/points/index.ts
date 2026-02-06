import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, generateId, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const url = new URL(context.request.url);
    const semester_id = url.searchParams.get('semester_id');
    const member_id = url.searchParams.get('member_id');

    let query = `SELECT p.*, m.first_name, m.last_name, c.name as category_name, a.first_name as awarded_first, a.last_name as awarded_last
                 FROM points p
                 JOIN members m ON p.member_id = m.id
                 JOIN point_categories c ON p.category_id = c.id
                 JOIN members a ON p.awarded_by = a.id`;
    const conditions: string[] = [];
    const params: string[] = [];

    if (semester_id) { conditions.push('p.semester_id = ?'); params.push(semester_id); }
    if (member_id) { conditions.push('p.member_id = ?'); params.push(member_id); }
    if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
    query += ` ORDER BY p.created_at DESC LIMIT 500`;

    const rows = await context.env.DB.prepare(query).bind(...params).all();
    return json(rows.results);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, ['admin', 'president', 'vpi']);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as Record<string, unknown>;
    const member_id = sanitize(body.member_id as string);
    const category_id = sanitize(body.category_id as string);
    const semester_id = sanitize(body.semester_id as string);
    const pts = Number(body.points) || 0;
    const reason = sanitize(body.reason as string) || null;
    const event_id = sanitize(body.event_id as string) || null;

    if (!member_id || !category_id || !semester_id || pts === 0) return error('member_id, category_id, semester_id, and non-zero points are required');

    const id = generateId();
    await context.env.DB.prepare(
      `INSERT INTO points (id, member_id, category_id, semester_id, points, reason, event_id, awarded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, member_id, category_id, semester_id, pts, reason, event_id, result.auth.member.id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'award_points', 'points', id, { member_id, points: pts }, ip);

    return json({ id }, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
