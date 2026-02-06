-- Migration: Update role system from single 'exec' to granular roles
-- New roles: admin, president, vpi, vpx, treasurer, secretary, active, alumni, inactive

PRAGMA foreign_keys = OFF;

CREATE TABLE members_new (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'active' CHECK(role IN ('admin', 'president', 'vpi', 'vpx', 'treasurer', 'secretary', 'active', 'alumni', 'inactive')),
  phone TEXT,
  class_year TEXT,
  major TEXT,
  instagram TEXT,
  avatar_url TEXT,
  invited_by TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

-- Copy data, converting 'exec' to 'admin' (Kevin is the only exec currently)
INSERT INTO members_new (id, email, first_name, last_name, role, phone, class_year, major, instagram, avatar_url, invited_by, is_active, created_at, updated_at, last_login_at)
SELECT id, email, first_name, last_name,
  CASE WHEN role = 'exec' THEN 'admin' ELSE role END,
  phone, class_year, major, instagram, avatar_url, invited_by, is_active, created_at, updated_at, last_login_at
FROM members;

DROP TABLE members;

ALTER TABLE members_new RENAME TO members;

PRAGMA foreign_keys = ON;
