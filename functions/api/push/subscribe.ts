import type { Env } from '../../types';
import { requireAuth, generateId } from '../../lib/auth';
import { json, error, options } from '../../lib/response';

// POST: Save push subscription
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as { endpoint?: string; p256dh?: string; auth?: string };
    if (!body.endpoint || !body.p256dh || !body.auth) {
      return error('Missing endpoint, p256dh, or auth', 400);
    }

    const id = generateId();
    const ua = context.request.headers.get('user-agent') || null;

    await context.env.DB.prepare(
      `INSERT INTO push_subscriptions (id, member_id, endpoint, p256dh, auth, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(member_id, endpoint) DO UPDATE SET p256dh = ?, auth = ?, user_agent = ?`
    ).bind(
      id, result.auth.member.id, body.endpoint, body.p256dh, body.auth, ua,
      body.p256dh, body.auth, ua,
    ).run();

    return json({ ok: true });
  } catch {
    return error('Internal server error', 500);
  }
};

// DELETE: Remove push subscription
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as { endpoint?: string };
    if (!body.endpoint) return error('Missing endpoint', 400);

    await context.env.DB.prepare(
      'DELETE FROM push_subscriptions WHERE member_id = ? AND endpoint = ?'
    ).bind(result.auth.member.id, body.endpoint).run();

    return json({ ok: true });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
