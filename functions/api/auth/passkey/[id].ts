import type { Env } from '../../../types';
import { requireAuth, logAudit } from '../../../lib/auth';
import { json, error, options } from '../../../lib/response';
import { getClientIP } from '../../../lib/rate-limit';

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;
    const { member } = result.auth;

    const id = context.params.id as string;
    const ip = getClientIP(context.request);

    // Verify the passkey belongs to this member
    const credential = await context.env.DB.prepare(
      `SELECT id, name FROM passkey_credentials WHERE id = ? AND member_id = ?`
    ).bind(id, member.id).first();

    if (!credential) {
      return error('Passkey not found', 404);
    }

    // Delete the passkey
    await context.env.DB.prepare(
      `DELETE FROM passkey_credentials WHERE id = ?`
    ).bind(id).run();

    await logAudit(context.env.DB, member.id, 'passkey_deleted', 'passkey', id, { name: credential.name }, ip);

    return json({ success: true });
  } catch (e) {
    console.error('Passkey delete error:', e);
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
