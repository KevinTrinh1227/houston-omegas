-- Migration: Social media accounts and metrics tracking
CREATE TABLE IF NOT EXISTS social_accounts (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL CHECK(platform IN ('instagram','twitter','tiktok','youtube','facebook','linkedin')),
  handle TEXT NOT NULL,
  url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS social_metrics (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  recorded_date TEXT NOT NULL,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  notes TEXT,
  recorded_by TEXT NOT NULL REFERENCES members(id),
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(account_id, recorded_date)
);
CREATE INDEX IF NOT EXISTS idx_social_metrics_account ON social_metrics(account_id);
