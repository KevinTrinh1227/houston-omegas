-- Migration: Media gallery for storing uploaded files
CREATE TABLE IF NOT EXISTS media_files (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  category TEXT DEFAULT 'general',
  description TEXT,
  uploaded_by TEXT NOT NULL REFERENCES members(id),
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_media_category ON media_files(category);
