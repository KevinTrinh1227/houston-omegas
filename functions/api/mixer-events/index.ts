import type { Env } from '../../types';
import { requireAuth, generateId, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, ['admin', 'president', 'vpx']);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as Record<string, unknown>;
    const org_id = sanitize(body.org_id as string);
    const title = sanitize(body.title as string);
    const event_date = sanitize(body.event_date as string);

    if (!org_id || !title || !event_date) return error('org_id, title, and event_date are required');

    const id = generateId();
    await context.env.DB.prepare(
      `INSERT INTO mixer_events (id, org_id, title, event_date, location, description, semester_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, org_id, title, event_date, sanitize(body.location as string) || null, sanitize(body.description as string) || null, sanitize(body.semester_id as string) || null, result.auth.member.id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'create_mixer_event', 'mixer_event', id, { org_id, title }, ip);

    return json({ id }, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
