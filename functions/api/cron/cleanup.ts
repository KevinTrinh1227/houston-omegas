import type { Env } from '../../types';

// Called by Cloudflare Cron Trigger (daily at 3 AM UTC)
// Can also be called manually for testing
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;

    // Delete expired sessions
    const sessions = await db.prepare(
      `DELETE FROM sessions WHERE expires_at < datetime('now')`
    ).run();

    // Delete used and expired OTPs (older than 1 hour)
    const otps = await db.prepare(
      `DELETE FROM otp_codes WHERE used_at IS NOT NULL OR expires_at < datetime('now', '-1 hour')`
    ).run();

    // Delete old rate limit entries (older than 2 hours)
    const rateLimits = await db.prepare(
      `DELETE FROM rate_limits WHERE window < datetime('now', '-2 hours')`
    ).run();

    return new Response(JSON.stringify({
      success: true,
      cleaned: {
        sessions: sessions.meta?.changes ?? 0,
        otps: otps.meta?.changes ?? 0,
        rate_limits: rateLimits.meta?.changes ?? 0,
      },
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Cleanup failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
