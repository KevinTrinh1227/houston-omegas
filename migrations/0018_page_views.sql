-- Page view tracking
CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page TEXT NOT NULL,
  referrer TEXT,
  ip TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_page_views_page ON page_views(page);
CREATE INDEX idx_page_views_created ON page_views(created_at);

-- Member status for pre-creation flow
ALTER TABLE members ADD COLUMN status TEXT DEFAULT 'active' CHECK(status IN ('pending','active','inactive','alumni'));
