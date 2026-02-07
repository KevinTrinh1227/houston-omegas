-- Migration: Wiki pages for internal documentation
CREATE TABLE IF NOT EXISTS wiki_pages (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  role_tag TEXT,
  sort_order INTEGER DEFAULT 0,
  created_by TEXT NOT NULL REFERENCES members(id),
  updated_by TEXT REFERENCES members(id),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_wiki_slug ON wiki_pages(slug);
CREATE INDEX IF NOT EXISTS idx_wiki_category ON wiki_pages(category);
