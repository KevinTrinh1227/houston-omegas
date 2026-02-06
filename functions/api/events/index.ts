import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, generateId, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';
import { notifyEventCreated } from '../../lib/notify';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const url = new URL(context.request.url);
    const semester_id = url.searchParams.get('semester_id');
    const event_type = url.searchParams.get('event_type');

    let query = `SELECT e.*, m.first_name as creator_first, m.last_name as creator_last
                 FROM events e JOIN members m ON e.created_by = m.id`;
    const conditions: string[] = [];
    const params: string[] = [];

    if (semester_id) { conditions.push('e.semester_id = ?'); params.push(semester_id); }
    if (event_type) { conditions.push('e.event_type = ?'); params.push(event_type); }
    if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
    query += ` ORDER BY e.start_time DESC`;

    const rows = await context.env.DB.prepare(query).bind(...params).all();
    return json(rows.results);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as Record<string, unknown>;
    const title = sanitize(body.title as string);
    const description = sanitize(body.description as string) || null;
    const event_type = sanitize(body.event_type as string) || 'general';
    const location = sanitize(body.location as string) || null;
    const start_time = sanitize(body.start_time as string);
    const end_time = sanitize(body.end_time as string) || null;
    const semester_id = sanitize(body.semester_id as string) || null;
    const is_mandatory = body.is_mandatory ? 1 : 0;
    const points_value = Number(body.points_value) || 0;

    if (!title || !start_time) return error('Title and start_time are required');

    const id = generateId();
    await context.env.DB.prepare(
      `INSERT INTO events (id, title, description, event_type, location, start_time, end_time, semester_id, is_mandatory, points_value, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, title, description, event_type, location, start_time, end_time, semester_id, is_mandatory, points_value, result.auth.member.id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'create_event', 'event', id, { title }, ip);

    await notifyEventCreated(context.env.DISCORD_WEBHOOK_URL, title, start_time, `${result.auth.member.first_name} ${result.auth.member.last_name}`);

    return json({ id, title, event_type, start_time }, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
