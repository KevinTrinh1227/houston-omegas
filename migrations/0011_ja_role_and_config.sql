-- Migration: Add junior_active role and chapter config table
-- Note: SQLite doesn't support ALTER CHECK constraints, so role validation
-- is handled at the application layer (types.ts / roles.ts).
-- The existing role column is TEXT with no CHECK in production (0002 migration removed the old CHECK).

-- Chapter configuration table for eboard-configurable settings
CREATE TABLE IF NOT EXISTS chapter_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_by TEXT REFERENCES members(id),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Default config values
INSERT OR IGNORE INTO chapter_config (key, value) VALUES ('ja_attendance_threshold', '90');
INSERT OR IGNORE INTO chapter_config (key, value) VALUES ('ja_probation_weeks', '8');

-- Add onboarding flag (1 = completed, 0 = needs onboarding)
-- Existing members default to 1 (already onboarded)
ALTER TABLE members ADD COLUMN has_completed_onboarding INTEGER NOT NULL DEFAULT 1;
