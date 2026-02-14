import type { Env } from '../../../types';
import { requireAuth, generateId } from '../../../lib/auth';
import { json, error, options } from '../../../lib/response';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { getClientIP } from '../../../lib/rate-limit';

const RP_NAME = 'Houston Omegas';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;
    const { member } = result.auth;

    const url = new URL(context.request.url);
    const rpID = url.hostname;

    // Get existing passkeys for this member (to exclude from registration)
    const existingCredentials = await context.env.DB.prepare(
      `SELECT credential_id, transports FROM passkey_credentials WHERE member_id = ?`
    ).bind(member.id).all();

    const excludeCredentials = existingCredentials.results.map((cred) => ({
      id: cred.credential_id as string,
      transports: cred.transports ? JSON.parse(cred.transports as string) : undefined,
    }));

    // Generate registration options
    const registrationOptions = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID,
      userName: member.email,
      userDisplayName: `${member.first_name} ${member.last_name}`.trim() || member.email,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform', // Prefer platform authenticators (Face ID, Touch ID)
      },
      timeout: 60000,
    });

    // Store the challenge
    const challengeId = generateId();
    const ip = getClientIP(context.request);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    await context.env.DB.prepare(
      `INSERT INTO passkey_challenges (id, member_id, challenge, type, ip_address, expires_at)
       VALUES (?, ?, ?, 'registration', ?, ?)`
    ).bind(challengeId, member.id, registrationOptions.challenge, ip, expiresAt).run();

    return json(registrationOptions);
  } catch (e) {
    console.error('Passkey register-options error:', e);
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
