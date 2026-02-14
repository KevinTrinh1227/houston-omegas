import type { Env } from '../../../types';
import { requireAuth, generateId, logAudit } from '../../../lib/auth';
import { json, error, options } from '../../../lib/response';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';
import { getClientIP } from '../../../lib/rate-limit';

const RP_NAME = 'Houston Omegas';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;
    const { member } = result.auth;

    const body = await context.request.json() as RegistrationResponseJSON & { name?: string };
    const ip = getClientIP(context.request);

    const url = new URL(context.request.url);
    const rpID = url.hostname;
    const origin = url.origin;

    // Get the stored challenge
    const challengeRow = await context.env.DB.prepare(
      `SELECT id, challenge FROM passkey_challenges
       WHERE member_id = ? AND type = 'registration' AND used_at IS NULL AND expires_at > datetime('now')
       ORDER BY created_at DESC LIMIT 1`
    ).bind(member.id).first();

    if (!challengeRow) {
      return error('Challenge expired or not found. Please try again.', 400);
    }

    // Mark challenge as used
    await context.env.DB.prepare(
      `UPDATE passkey_challenges SET used_at = datetime('now') WHERE id = ?`
    ).bind(challengeRow.id).run();

    // Verify the registration
    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge: challengeRow.challenge as string,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: false, // Be lenient on older devices
      });
    } catch (e) {
      console.error('Passkey verification error:', e);
      return error('Failed to verify passkey. Please try again.', 400);
    }

    if (!verification.verified || !verification.registrationInfo) {
      return error('Passkey verification failed.', 400);
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

    // Generate a user-friendly name for the passkey
    const ua = context.request.headers.get('User-Agent') || '';
    let deviceName = body.name || 'Passkey';
    if (!body.name) {
      if (ua.includes('iPhone') || ua.includes('iPad')) {
        deviceName = ua.includes('iPad') ? 'iPad Face ID' : 'iPhone Face ID';
      } else if (ua.includes('Mac')) {
        deviceName = 'MacBook Touch ID';
      } else if (ua.includes('Android')) {
        deviceName = 'Android Device';
      } else if (ua.includes('Windows')) {
        deviceName = 'Windows Hello';
      }
    }

    // Store the credential
    const credentialId = generateId();
    const publicKeyBase64 = Buffer.from(credential.publicKey).toString('base64');
    const credentialIdBase64 = Buffer.from(credential.id).toString('base64url');
    const transports = body.response.transports ? JSON.stringify(body.response.transports) : null;

    await context.env.DB.prepare(
      `INSERT INTO passkey_credentials (id, member_id, credential_id, public_key, counter, transports, device_type, backed_up, name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      credentialId,
      member.id,
      credentialIdBase64,
      publicKeyBase64,
      credential.counter,
      transports,
      credentialDeviceType,
      credentialBackedUp ? 1 : 0,
      deviceName
    ).run();

    await logAudit(context.env.DB, member.id, 'passkey_registered', 'passkey', credentialId, { deviceName, deviceType: credentialDeviceType }, ip);

    return json({
      success: true,
      credential: {
        id: credentialId,
        name: deviceName,
        device_type: credentialDeviceType,
        backed_up: credentialBackedUp,
        created_at: new Date().toISOString(),
      }
    });
  } catch (e) {
    console.error('Passkey register error:', e);
    return error('Internal server error', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
