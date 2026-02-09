import type { Env } from '../../types';
import { requireAuth } from '../../lib/auth';
import { json, error, options } from '../../lib/response';

// GET: Return VAPID public key (authenticated members only)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const publicKey = context.env.VAPID_PUBLIC_KEY;
    if (!publicKey) return error('Push notifications not configured', 503);

    return json({ publicKey });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
