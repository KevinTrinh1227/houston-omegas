import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sendToAll } from '../../lib/web-push';

// POST: Send push notification to all subscribers (exec only)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as { title?: string; body?: string; url?: string; tag?: string };
    if (!body.title || !body.body) {
      return error('Missing title or body', 400);
    }
    if (JSON.stringify(body).length > 3000) {
      return error('Payload too large', 400);
    }

    const vapidPub = context.env.VAPID_PUBLIC_KEY;
    const vapidPriv = context.env.VAPID_PRIVATE_KEY;
    if (!vapidPub || !vapidPriv) return error('Push notifications not configured', 503);

    const payload = {
      title: body.title,
      body: body.body,
      url: body.url || '/dashboard',
      tag: body.tag || 'announcement',
    };

    const stats = await sendToAll(context.env.DB, payload, vapidPub, vapidPriv);

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'push_send', 'push', null, stats, ip);

    return json(stats);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
