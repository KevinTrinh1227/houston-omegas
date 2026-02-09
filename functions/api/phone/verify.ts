import type { Env } from '../../types';
import { requireAuth, logAudit } from '../../lib/auth';
import { getClientIP } from '../../lib/rate-limit';
import { json, error, options } from '../../lib/response';
import { isValidUSPhone, normalizePhone, verifyPhoneOTP } from '../../lib/sms';
import { sanitize } from '../../lib/validate';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as { phone?: string; code?: string };
    if (!body.phone || !body.code) return error('Phone and code are required');

    if (!isValidUSPhone(body.phone)) {
      return error('Please enter a valid US phone number');
    }

    const code = body.code.replace(/\D/g, '');
    if (code.length !== 6) return error('Code must be 6 digits');

    const verifyResult = await verifyPhoneOTP(context.env.DB, body.phone, code);
    if (!verifyResult.success) {
      return error(verifyResult.error || 'Verification failed');
    }

    // Update member: set phone + phone_verified = 1
    const normalized = normalizePhone(body.phone);
    const displayPhone = sanitize(body.phone);

    await context.env.DB.prepare(
      `UPDATE members SET phone = ?, phone_verified = 1, updated_at = datetime('now') WHERE id = ?`
    ).bind(displayPhone, result.auth.member.id).run();

    const ip = getClientIP(context.request);
    await logAudit(context.env.DB, result.auth.member.id, 'verify_phone', 'member', result.auth.member.id, { phone: normalized }, ip);

    return json({ success: true, message: 'Phone verified successfully' });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
