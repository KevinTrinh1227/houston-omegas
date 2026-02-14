-- Migration: Add passkey (WebAuthn) support for biometric login
-- Tables for storing passkey credentials and authentication challenges

-- Passkey credentials table
CREATE TABLE IF NOT EXISTS passkey_credentials (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  transports TEXT,                -- JSON array of transports (e.g., ["internal", "hybrid"])
  device_type TEXT,               -- "platform" (Face ID, Touch ID) or "cross-platform" (YubiKey)
  backed_up INTEGER DEFAULT 0,    -- 1 if credential is backed up (synced passkey)
  name TEXT,                      -- User-friendly name (e.g., "iPhone Face ID", "MacBook Touch ID")
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_used_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_passkey_credentials_member ON passkey_credentials(member_id);
CREATE INDEX IF NOT EXISTS idx_passkey_credentials_credential_id ON passkey_credentials(credential_id);

-- Passkey challenges table (for WebAuthn ceremonies)
CREATE TABLE IF NOT EXISTS passkey_challenges (
  id TEXT PRIMARY KEY,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  challenge TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK(type IN ('registration', 'authentication')),
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL DEFAULT (datetime('now', '+5 minutes')),
  used_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_passkey_challenges_challenge ON passkey_challenges(challenge);
CREATE INDEX IF NOT EXISTS idx_passkey_challenges_member ON passkey_challenges(member_id);
CREATE INDEX IF NOT EXISTS idx_passkey_challenges_expires ON passkey_challenges(expires_at);
