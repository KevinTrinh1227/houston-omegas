import type { Env } from '../../../types';
import { generateToken, getSessionCookie, logAudit } from '../../../lib/auth';
import { json, error, options } from '../../../lib/response';
import { isValidUSPhone, normalizePhone, verifyPhoneOTP } from '../../../lib/sms';
import { checkRateLimit, getClientIP } from '../../../lib/rate-limit';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as { phone?: string; code?: string };
    if (!body.phone || !body.code) return error('Phone and code are required');

    if (!isValidUSPhone(body.phone)) {
      return error('Please enter a valid US phone number');
    }

    const code = body.code.replace(/\D/g, '');
    if (code.length !== 6) return error('Code must be 6 digits');

    const ip = getClientIP(context.request);

    // Rate limit by IP: 10 verify attempts per 10 minutes
    const allowed = await checkRateLimit(context.env.DB, `phone_verify_login:${ip}`, 10, 10);
    if (!allowed) {
      return error('Too many attempts. Try again in a few minutes.', 429);
    }

    const normalized = normalizePhone(body.phone);

    // Find the member by phone
    const member = await context.env.DB.prepare(
      `SELECT id, is_active, phone_verified, has_completed_onboarding FROM members WHERE phone = ? OR phone = ?`
    ).bind(body.phone.replace(/\D/g, ''), normalized).first();

    if (!member || member.is_active !== 1) {
      return error('Invalid phone or code');
    }

    // Verify the OTP
    const verifyResult = await verifyPhoneOTP(context.env.DB, body.phone, code);
    if (!verifyResult.success) {
      return error(verifyResult.error || 'Verification failed');
    }

    // Mark phone as verified if not already
    if (!member.phone_verified) {
      await context.env.DB.prepare(
        `UPDATE members SET phone_verified = 1, updated_at = datetime('now') WHERE id = ?`
      ).bind(member.id).run();
    }

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const ua = context.request.headers.get('User-Agent') || 'unknown';

    await context.env.DB.prepare(
      `INSERT INTO sessions (id, member_id, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(token, member.id, ip, ua, expiresAt).run();

    await context.env.DB.prepare(
      `UPDATE members SET last_login_at = datetime('now') WHERE id = ?`
    ).bind(member.id).run();

    await logAudit(context.env.DB, member.id as string, 'login_phone', 'member', member.id as string, { ip }, ip);

    // Return redirect URL based on onboarding status
    const redirectTo = member.has_completed_onboarding === 0 ? '/onboarding' : '/dashboard';

    return json(
      { success: true, redirect: redirectTo },
      200,
      { 'Set-Cookie': getSessionCookie(token) }
    );
  } catch {
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
