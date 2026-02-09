import type { Env } from '../../../types';
import { json, error, options } from '../../../lib/response';
import { isValidUSPhone, normalizePhone, sendPhoneOTP } from '../../../lib/sms';
import { checkRateLimit, getClientIP } from '../../../lib/rate-limit';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as { phone?: string };
    if (!body.phone) return error('Phone number is required');

    if (!isValidUSPhone(body.phone)) {
      return error('Please enter a valid US phone number (10 digits)');
    }

    const normalized = normalizePhone(body.phone);
    const ip = getClientIP(context.request);

    // Rate limit by IP: 5 attempts per 10 minutes
    const allowed = await checkRateLimit(context.env.DB, `phone_login:${ip}`, 10, 5);
    if (!allowed) {
      return error('Too many attempts. Try again in a few minutes.', 429);
    }

    // Check if a member with this phone exists and is active
    const member = await context.env.DB.prepare(
      `SELECT id, phone, is_active FROM members WHERE phone = ? OR phone = ?`
    ).bind(body.phone.replace(/\D/g, ''), normalized).first();

    if (!member || member.is_active !== 1) {
      // Don't reveal whether the phone exists — just say code sent
      // But don't actually send anything
      return json({ success: true, message: 'If this number is registered, a code has been sent.' });
    }

    const otpResult = await sendPhoneOTP(context.env.DB, body.phone, context.env);
    if (!otpResult.success) {
      return error(otpResult.error || 'Failed to send code', 429);
    }

    return json({ success: true, message: 'If this number is registered, a code has been sent.' });
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
