#!/usr/bin/env node
// Generate VAPID key pair for Web Push notifications

const crypto = require('crypto');

const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'prime256v1',
});

const pubJwk = publicKey.export({ format: 'jwk' });
const privJwk = privateKey.export({ format: 'jwk' });

// Convert to raw uncompressed format: 0x04 || x(32) || y(32)
const x = Buffer.from(pubJwk.x, 'base64url');
const y = Buffer.from(pubJwk.y, 'base64url');
const d = Buffer.from(privJwk.d, 'base64url');

const publicKeyRaw = Buffer.concat([Buffer.from([0x04]), x, y]);
const publicKeyB64 = publicKeyRaw.toString('base64url');
const privateKeyB64 = d.toString('base64url');

console.log('VAPID keys generated!\n');
console.log('Public Key (base64url):');
console.log(publicKeyB64);
console.log('\nPrivate Key (base64url):');
console.log(privateKeyB64);
console.log('\nSet as Cloudflare Pages secrets:');
console.log(`npx wrangler pages secret put VAPID_PUBLIC_KEY --project-name=houston-omegas`);
console.log(`npx wrangler pages secret put VAPID_PRIVATE_KEY --project-name=houston-omegas`);
