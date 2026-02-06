-- Migration: Add activity log for analytics

CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id TEXT REFERENCES members(id),
  action TEXT NOT NULL,
  page TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_activity_member ON activity_log(member_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at);
