-- Public-facing event fields for party/event pages
ALTER TABLE events ADD COLUMN slug TEXT;
ALTER TABLE events ADD COLUMN is_public INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN flyer_url TEXT;
ALTER TABLE events ADD COLUMN cover_url TEXT;
ALTER TABLE events ADD COLUMN address TEXT;
ALTER TABLE events ADD COLUMN map_url TEXT;
ALTER TABLE events ADD COLUMN age_requirement TEXT;
ALTER TABLE events ADD COLUMN dress_code TEXT;
ALTER TABLE events ADD COLUMN ticket_url TEXT;
ALTER TABLE events ADD COLUMN ticket_price TEXT;
ALTER TABLE events ADD COLUMN rules TEXT DEFAULT '[]';
ALTER TABLE events ADD COLUMN faq TEXT DEFAULT '[]';
ALTER TABLE events ADD COLUMN disclaimer TEXT;
ALTER TABLE events ADD COLUMN capacity TEXT;
ALTER TABLE events ADD COLUMN parking_info TEXT;
ALTER TABLE events ADD COLUMN contact_info TEXT;
ALTER TABLE events ADD COLUMN socials TEXT DEFAULT '{}';

-- Add unique index for slug (can't do UNIQUE in ALTER TABLE with SQLite)
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
