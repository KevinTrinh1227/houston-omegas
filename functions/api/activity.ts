import type { Env } from '../types';
import { authenticate } from '../lib/auth';
import { json, error } from '../lib/response';
import { sanitize } from '../lib/validate';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await authenticate(context.request, context.env.DB);
    if (!auth) return error('Unauthorized', 401);

    const body = await context.request.json() as { action: string; page?: string };
    const action = sanitize(body.action);
    const page = sanitize(body.page || '');

    if (!action) return error('Action is required');

    await context.env.DB.prepare(
      `INSERT INTO activity_log (member_id, action, page) VALUES (?, ?, ?)`
    ).bind(auth.member.id, action, page || null).run();

    return json({ ok: true });
  } catch {
    return error('Internal server error', 500);
  }
};
