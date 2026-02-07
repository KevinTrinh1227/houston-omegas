import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, generateId, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

const ALLOWED_PLATFORMS = ['instagram', 'twitter', 'tiktok', 'youtube', 'facebook', 'linkedin'];

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const rows = await context.env.DB.prepare(
      `SELECT * FROM social_accounts WHERE is_active = 1 ORDER BY platform`
    ).all();

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
    const platform = sanitize(body.platform as string);
    const handle = sanitize(body.handle as string);
    const url = sanitize(body.url as string) || null;

    if (!platform || !handle) return error('platform and handle are required');
    if (!ALLOWED_PLATFORMS.includes(platform)) return error(`Invalid platform. Allowed: ${ALLOWED_PLATFORMS.join(', ')}`);

    const id = generateId();
    await context.env.DB.prepare(
      `INSERT INTO social_accounts (id, platform, handle, url) VALUES (?, ?, ?, ?)`
    ).bind(id, platform, handle, url).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'create_social_account', 'social_account', id, { platform, handle }, ip);

    const record = await context.env.DB.prepare(`SELECT * FROM social_accounts WHERE id = ?`).bind(id).first();
    return json(record, 201);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
