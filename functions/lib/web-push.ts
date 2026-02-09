// Web Push implementation for Cloudflare Workers using Web Crypto API
// Implements VAPID (RFC 8292) + aes128gcm content encryption (RFC 8291)

interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;  // base64url, 65 bytes uncompressed EC point
  auth: string;    // base64url, 16 bytes auth secret
}

interface PushResult {
  success: boolean;
  status: number;
  endpoint: string;
}

// ── Base64url helpers ──

function b64urlEncode(data: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ── VAPID JWT (RFC 8292) ──

async function createVapidAuth(
  endpoint: string,
  publicKey: string,
  privateKey: string,
): Promise<string> {
  const audience = new URL(endpoint).origin;
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60;

  const header = b64urlEncode(new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = b64urlEncode(new TextEncoder().encode(JSON.stringify({
    aud: audience,
    exp,
    sub: 'mailto:admin@houstonomegas.com',
  })));

  const unsigned = `${header}.${payload}`;

  // Build JWK from raw VAPID keys
  const pubBytes = b64urlDecode(publicKey);
  const x = b64urlEncode(pubBytes.slice(1, 33));
  const y = b64urlEncode(pubBytes.slice(33, 65));

  const key = await crypto.subtle.importKey(
    'jwk',
    { kty: 'EC', crv: 'P-256', x, y, d: privateKey },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );

  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(unsigned),
  );

  const jwt = `${unsigned}.${b64urlEncode(new Uint8Array(sig))}`;
  return `vapid t=${jwt}, k=${publicKey}`;
}

// ── Payload Encryption (RFC 8291, aes128gcm) ──

async function encryptPayload(
  clientPubKey: string,
  clientAuth: string,
  payload: string,
): Promise<Uint8Array> {
  // Generate ephemeral ECDH key pair
  const localKeys = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  ) as CryptoKeyPair;

  // Import client's public key
  const clientPubBytes = b64urlDecode(clientPubKey);
  const clientKey = await crypto.subtle.importKey(
    'raw',
    clientPubBytes,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  );

  // ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'ECDH', public: clientKey },
      localKeys.privateKey,
      256,
    ),
  );

  // Export local public key
  const serverPubBytes = new Uint8Array(
    await crypto.subtle.exportKey('raw', localKeys.publicKey),
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const authBytes = b64urlDecode(clientAuth);

  // Derive IKM: HKDF(salt=auth, ikm=sharedSecret, info="WebPush: info\0" || client_pub || server_pub)
  const infoPrefix = new TextEncoder().encode('WebPush: info\0');
  const info = new Uint8Array(infoPrefix.length + 65 + 65);
  info.set(infoPrefix);
  info.set(clientPubBytes, infoPrefix.length);
  info.set(serverPubBytes, infoPrefix.length + 65);

  const sharedKey = await crypto.subtle.importKey('raw', sharedSecret, { name: 'HKDF' }, false, ['deriveBits']);
  const ikm = new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: authBytes, info }, sharedKey, 256),
  );

  // Derive CEK and nonce
  const ikmKey = await crypto.subtle.importKey('raw', ikm, { name: 'HKDF' }, false, ['deriveBits']);
  const cekInfo = new TextEncoder().encode('Content-Encoding: aes128gcm\0');
  const nonceInfo = new TextEncoder().encode('Content-Encoding: nonce\0');

  const cekBits = new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: cekInfo }, ikmKey, 128),
  );
  const nonceBits = new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: nonceInfo }, ikmKey, 96),
  );

  // Pad payload: content || 0x02 (last record delimiter)
  const payloadBytes = new TextEncoder().encode(payload);
  const padded = new Uint8Array(payloadBytes.length + 1);
  padded.set(payloadBytes);
  padded[payloadBytes.length] = 0x02;

  // Encrypt with AES-128-GCM
  const cek = await crypto.subtle.importKey('raw', cekBits, { name: 'AES-GCM' }, false, ['encrypt']);
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonceBits }, cek, padded),
  );

  // Build aes128gcm body: salt(16) || rs(4) || idlen(1) || keyid(65) || ciphertext
  const rs = 4096;
  const body = new Uint8Array(86 + encrypted.length);
  body.set(salt, 0);
  body[16] = (rs >> 24) & 0xff;
  body[17] = (rs >> 16) & 0xff;
  body[18] = (rs >> 8) & 0xff;
  body[19] = rs & 0xff;
  body[20] = 65;
  body.set(serverPubBytes, 21);
  body.set(encrypted, 86);

  return body;
}

// ── Public API ──

export async function sendNotification(
  sub: PushSubscriptionData,
  payload: object,
  vapidPublicKey: string,
  vapidPrivateKey: string,
): Promise<PushResult> {
  try {
    const auth = await createVapidAuth(sub.endpoint, vapidPublicKey, vapidPrivateKey);
    const body = await encryptPayload(sub.p256dh, sub.auth, JSON.stringify(payload));

    const res = await fetch(sub.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'TTL': '86400',
        'Urgency': 'normal',
      },
      body: body.buffer,
    });

    return { success: res.status >= 200 && res.status < 300, status: res.status, endpoint: sub.endpoint };
  } catch {
    return { success: false, status: 0, endpoint: sub.endpoint };
  }
}

export async function sendToAll(
  db: D1Database,
  payload: object,
  vapidPublicKey: string,
  vapidPrivateKey: string,
): Promise<{ sent: number; failed: number; removed: number }> {
  const subs = await db.prepare('SELECT endpoint, p256dh, auth FROM push_subscriptions').all();
  let sent = 0, failed = 0, removed = 0;

  for (const row of subs.results) {
    const result = await sendNotification(
      { endpoint: row.endpoint as string, p256dh: row.p256dh as string, auth: row.auth as string },
      payload,
      vapidPublicKey,
      vapidPrivateKey,
    );

    if (result.success) {
      sent++;
    } else if (result.status === 404 || result.status === 410) {
      // Subscription expired/invalid - remove
      await db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').bind(result.endpoint).run();
      removed++;
    } else {
      failed++;
    }
  }

  return { sent, failed, removed };
}
