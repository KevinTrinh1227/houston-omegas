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

    // Generate slug from title
    const slug = sanitize(body.slug as string) || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const is_public = body.is_public ? 1 : 0;
    const flyer_url = sanitize(body.flyer_url as string) || null;
    const cover_url = sanitize(body.cover_url as string) || null;
    const address = sanitize(body.address as string) || null;
    const map_url = sanitize(body.map_url as string) || null;
    const age_requirement = sanitize(body.age_requirement as string) || null;
    const dress_code = sanitize(body.dress_code as string) || null;
    const ticket_url = sanitize(body.ticket_url as string) || null;
    const ticket_price = sanitize(body.ticket_price as string) || null;
    const rules = typeof body.rules === 'string' ? body.rules : JSON.stringify(body.rules || []);
    const faq = typeof body.faq === 'string' ? body.faq : JSON.stringify(body.faq || []);
    const disclaimer = sanitize(body.disclaimer as string) || null;
    const capacity = sanitize(body.capacity as string) || null;
    const parking_info = sanitize(body.parking_info as string) || null;
    const contact_info = sanitize(body.contact_info as string) || null;

    const id = generateId();
    await context.env.DB.prepare(
      `INSERT INTO events (id, title, description, event_type, location, start_time, end_time, semester_id, is_mandatory, points_value, slug, is_public, flyer_url, cover_url, address, map_url, age_requirement, dress_code, ticket_url, ticket_price, rules, faq, disclaimer, capacity, parking_info, contact_info, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, title, description, event_type, location, start_time, end_time, semester_id, is_mandatory, points_value, slug, is_public, flyer_url, cover_url, address, map_url, age_requirement, dress_code, ticket_url, ticket_price, rules, faq, disclaimer, capacity, parking_info, contact_info, result.auth.member.id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'create_event', 'event', id, { title }, ip);

    await notifyEventCreated(context.env.DISCORD_WEBHOOK_URL, title, start_time, `${result.auth.member.first_name} ${result.auth.member.last_name}`);

    return json({ id, title, event_type, start_time }, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
