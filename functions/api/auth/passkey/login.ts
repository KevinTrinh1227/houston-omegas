import type { Env } from '../../../types';
import { generateToken, getSessionCookie, logAudit } from '../../../lib/auth';
import { json, error, options } from '../../../lib/response';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';
import { getClientIP, checkRateLimit } from '../../../lib/rate-limit';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const rpID = url.hostname;
    const origin = url.origin;
    const ip = getClientIP(context.request);

    // Rate limit
    const allowed = await checkRateLimit(context.env.DB, `passkey_login:${ip}`, 10, 10);
    if (!allowed) {
      return error('Too many attempts. Try again later.', 429);
    }

    const body = await context.request.json() as AuthenticationResponseJSON;

    // Find the credential
    const credentialIdBase64 = body.id;
    const credential = await context.env.DB.prepare(
      `SELECT pc.*, m.id as m_id, m.is_active, m.has_completed_onboarding
       FROM passkey_credentials pc
       JOIN members m ON pc.member_id = m.id
       WHERE pc.credential_id = ?`
    ).bind(credentialIdBase64).first();

    if (!credential) {
      return error('Passkey not found. Try another login method.', 400);
    }

    if (credential.is_active !== 1) {
      return error('Account is inactive.', 403);
    }

    // Get the stored challenge
    const challengeRow = await context.env.DB.prepare(
      `SELECT id, challenge FROM passkey_challenges
       WHERE type = 'authentication' AND used_at IS NULL AND expires_at > datetime('now')
       AND (member_id IS NULL OR member_id = ?)
       ORDER BY created_at DESC LIMIT 1`
    ).bind(credential.m_id).first();

    if (!challengeRow) {
      return error('Challenge expired. Please try again.', 400);
    }

    // Mark challenge as used
    await context.env.DB.prepare(
      `UPDATE passkey_challenges SET used_at = datetime('now'), member_id = ? WHERE id = ?`
    ).bind(credential.m_id, challengeRow.id).run();

    // Verify the authentication
    let verification;
    try {
      const publicKeyBytes = Uint8Array.from(Buffer.from(credential.public_key as string, 'base64'));

      verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge: challengeRow.challenge as string,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: credentialIdBase64,
          publicKey: publicKeyBytes,
          counter: credential.counter as number,
          transports: credential.transports ? JSON.parse(credential.transports as string) : undefined,
        },
        requireUserVerification: false,
      });
    } catch (e) {
      console.error('Passkey verification error:', e);
      return error('Passkey verification failed.', 400);
    }

    if (!verification.verified) {
      return error('Passkey verification failed.', 400);
    }

    // Update the counter and last_used_at
    await context.env.DB.prepare(
      `UPDATE passkey_credentials SET counter = ?, last_used_at = datetime('now') WHERE id = ?`
    ).bind(verification.authenticationInfo.newCounter, credential.id).run();

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const ua = context.request.headers.get('User-Agent') || 'unknown';

    await context.env.DB.prepare(
      `INSERT INTO sessions (id, member_id, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(token, credential.m_id, ip, ua, expiresAt).run();

    await context.env.DB.prepare(
      `UPDATE members SET last_login_at = datetime('now') WHERE id = ?`
    ).bind(credential.m_id).run();

    await logAudit(context.env.DB, credential.m_id as string, 'login_passkey', 'member', credential.m_id as string, { ip, passkey: credential.name }, ip);

    // Determine redirect based on onboarding status
    const redirectTo = credential.has_completed_onboarding === 0 ? '/onboarding' : '/dashboard';

    return json(
      { success: true, redirect: redirectTo },
      200,
      { 'Set-Cookie': getSessionCookie(token) }
    );
  } catch (e) {
    console.error('Passkey login error:', e);
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
