import type { Env } from '../../../types';
import { generateId } from '../../../lib/auth';
import { json, error, options } from '../../../lib/response';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { getClientIP, checkRateLimit } from '../../../lib/rate-limit';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const rpID = url.hostname;
    const ip = getClientIP(context.request);

    // Rate limit: 10 attempts per 10 minutes per IP
    const allowed = await checkRateLimit(context.env.DB, `passkey_login:${ip}`, 10, 10);
    if (!allowed) {
      return error('Too many attempts. Try again later.', 429);
    }

    // Get all passkeys in the system for discoverable credentials flow
    // WebAuthn will only show passkeys that exist on the user's device
    const allCredentials = await context.env.DB.prepare(
      `SELECT pc.credential_id, pc.transports, m.id as member_id
       FROM passkey_credentials pc
       JOIN members m ON pc.member_id = m.id
       WHERE m.is_active = 1`
    ).all();

    const allowCredentials = allCredentials.results.map((cred) => ({
      id: cred.credential_id as string,
      transports: cred.transports ? JSON.parse(cred.transports as string) : undefined,
    }));

    // Generate authentication options
    const authOptions = await generateAuthenticationOptions({
      rpID,
      allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
      userVerification: 'preferred',
      timeout: 60000,
    });

    // Store the challenge (without member_id since we don't know who's logging in yet)
    const challengeId = generateId();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await context.env.DB.prepare(
      `INSERT INTO passkey_challenges (id, member_id, challenge, type, ip_address, expires_at)
       VALUES (?, NULL, ?, 'authentication', ?, ?)`
    ).bind(challengeId, authOptions.challenge, ip, expiresAt).run();

    return json(authOptions);
  } catch (e) {
    console.error('Passkey login-options error:', e);
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
