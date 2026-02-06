import type { Env } from '../../types';
import { parseSessionToken, clearSessionCookie, logAudit, authenticate } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error } from '../../lib/response';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await authenticate(context.request, context.env.DB);
    const token = parseSessionToken(context.request);

    if (token) {
      await context.env.DB.prepare(`DELETE FROM sessions WHERE id = ?`).bind(token).run();
    }

    if (auth) {
      const ip = getClientIP(context.request);
      await logAudit(context.env.DB, auth.member.id, 'logout', 'member', auth.member.id, null, ip);
    }

    return json(
      { success: true },
      200,
      { 'Set-Cookie': clearSessionCookie() }
    );
  } catch {
    return error('Internal server error', 500);
  }
};
