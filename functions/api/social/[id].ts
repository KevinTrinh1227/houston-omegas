import type { Env } from '../../types';
import { EXEC_ROLES } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { sanitize } from '../../lib/validate';

export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;
    const body = await context.request.json() as Record<string, unknown>;

    const handle = sanitize(body.handle as string);
    const url = sanitize(body.url as string);
    const is_active = body.is_active !== undefined ? (body.is_active ? 1 : 0) : undefined;

    const sets: string[] = [];
    const params: (string | number)[] = [];

    if (handle) { sets.push('handle = ?'); params.push(handle); }
    if (url !== undefined) { sets.push('url = ?'); params.push(url || ''); }
    if (is_active !== undefined) { sets.push('is_active = ?'); params.push(is_active); }

    if (!sets.length) return error('No fields to update');

    params.push(id);
    const updated = await context.env.DB.prepare(
      `UPDATE social_accounts SET ${sets.join(', ')} WHERE id = ? RETURNING *`
    ).bind(...params).first();

    if (!updated) return error('Social account not found', 404);

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'update_social_account', 'social_account', id, { handle, url, is_active }, ip);

    return json(updated);
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB, EXEC_ROLES);
    if (result.errorResponse) return result.errorResponse;

    const id = (context.params as { id: string }).id;

    const account = await context.env.DB.prepare(`SELECT * FROM social_accounts WHERE id = ?`).bind(id).first();
    if (!account) return error('Social account not found', 404);

    await context.env.DB.prepare(`DELETE FROM social_accounts WHERE id = ?`).bind(id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'delete_social_account', 'social_account', id, { platform: account.platform, handle: account.handle }, ip);

    return json({ success: true });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
