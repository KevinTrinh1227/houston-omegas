import type { Env } from '../types';

export function generateOTP(): string {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  const num = ((bytes[0] << 16) | (bytes[1] << 8) | bytes[2]) % 1000000;
  return String(num).padStart(6, '0');
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
  return '+' + digits;
}

export function isValidUSPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
}

export async function sendSMS(to: string, body: string, env: Env): Promise<boolean> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);

  const params = new URLSearchParams({
    To: to,
    From: env.TWILIO_PHONE_NUMBER,
    Body: body,
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  return res.ok;
}

export async function sendPhoneOTP(
  db: D1Database,
  phone: string,
  env: Env
): Promise<{ success: boolean; error?: string }> {
  const normalized = normalizePhone(phone);

  // Rate limit: 3 codes per 10 minutes per phone
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const recent = await db.prepare(
    `SELECT COUNT(*) as cnt FROM otp_codes WHERE email = ? AND created_at > ? AND used_at IS NULL`
  ).bind(normalized, tenMinAgo).first();

  if (recent && (recent.cnt as number) >= 3) {
    return { success: false, error: 'Too many codes sent. Try again in a few minutes.' };
  }

  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await db.prepare(
    `INSERT INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)`
  ).bind(normalized, code, expiresAt).run();

  const sent = await sendSMS(normalized, `Your Houston Omegas verification code is: ${code}`, env);
  if (!sent) {
    return { success: false, error: 'Failed to send SMS. Check phone number.' };
  }

  return { success: true };
}

export async function verifyPhoneOTP(
  db: D1Database,
  phone: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const normalized = normalizePhone(phone);

  // Check attempts: max 5 per code window
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const attempts = await db.prepare(
    `SELECT COUNT(*) as cnt FROM otp_codes WHERE email = ? AND created_at > ? AND used_at IS NOT NULL AND code != ?`
  ).bind(normalized, fiveMinAgo, code).first();

  if (attempts && (attempts.cnt as number) >= 5) {
    return { success: false, error: 'Too many failed attempts. Request a new code.' };
  }

  const row = await db.prepare(
    `SELECT id, code FROM otp_codes
     WHERE email = ? AND expires_at > datetime('now') AND used_at IS NULL
     ORDER BY created_at DESC LIMIT 1`
  ).bind(normalized).first();

  if (!row) {
    return { success: false, error: 'Code expired or not found. Request a new one.' };
  }

  if (row.code !== code) {
    // Mark as failed attempt
    await db.prepare(
      `UPDATE otp_codes SET used_at = datetime('now') WHERE id = ?`
    ).bind(row.id).run();
    return { success: false, error: 'Invalid code.' };
  }

  // Mark as used
  await db.prepare(
    `UPDATE otp_codes SET used_at = datetime('now') WHERE id = ?`
  ).bind(row.id).run();

  return { success: true };
}
