import type { Env } from '../../../types';
import { requireAuth } from '../../../lib/auth';
import { json, error, options } from '../../../lib/response';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;
    const { member } = result.auth;

    const credentials = await context.env.DB.prepare(
      `SELECT id, name, device_type, backed_up, created_at, last_used_at
       FROM passkey_credentials
       WHERE member_id = ?
       ORDER BY created_at DESC`
    ).bind(member.id).all();

    const passkeys = credentials.results.map((cred) => ({
      id: cred.id,
      name: cred.name,
      device_type: cred.device_type,
      backed_up: cred.backed_up === 1,
      created_at: cred.created_at,
      last_used_at: cred.last_used_at,
    }));

    return json({ passkeys });
  } catch (e) {
    console.error('Passkey list error:', e);
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
