-- Partners table
CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  description TEXT,
  category TEXT DEFAULT 'sponsor' CHECK(category IN ('sponsor','affiliate','organization','vendor')),
  tier TEXT DEFAULT 'bronze' CHECK(tier IN ('gold','silver','bronze','community')),
  website_url TEXT,
  instagram TEXT,
  tiktok TEXT,
  twitter TEXT,
  facebook TEXT,
  youtube TEXT,
  email TEXT,
  phone TEXT,
  images TEXT DEFAULT '[]',
  is_active INTEGER DEFAULT 1,
  is_current INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_by TEXT NOT NULL REFERENCES members(id),
  updated_by TEXT REFERENCES members(id),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Announcement enhancements
ALTER TABLE announcements ADD COLUMN image_url TEXT;
ALTER TABLE announcements ADD COLUMN target_pages TEXT DEFAULT '[]';
