-- Migration: Add point categories, points, and brother dates tables

CREATE TABLE IF NOT EXISTS point_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  default_points INTEGER DEFAULT 1,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS points (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id),
  category_id TEXT NOT NULL REFERENCES point_categories(id),
  semester_id TEXT NOT NULL REFERENCES semesters(id),
  points INTEGER NOT NULL,
  reason TEXT,
  event_id TEXT REFERENCES events(id),
  awarded_by TEXT NOT NULL REFERENCES members(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_points_member ON points(member_id);
CREATE INDEX IF NOT EXISTS idx_points_semester ON points(semester_id);
CREATE INDEX IF NOT EXISTS idx_points_category ON points(category_id);

CREATE TABLE IF NOT EXISTS brother_dates (
  id TEXT PRIMARY KEY,
  member1_id TEXT NOT NULL REFERENCES members(id),
  member2_id TEXT NOT NULL REFERENCES members(id),
  date TEXT NOT NULL,
  semester_id TEXT NOT NULL REFERENCES semesters(id),
  description TEXT,
  photo_url TEXT,
  approved INTEGER DEFAULT 0,
  approved_by TEXT REFERENCES members(id),
  points_awarded INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  CHECK(member1_id < member2_id)
);

CREATE INDEX IF NOT EXISTS idx_brother_dates_semester ON brother_dates(semester_id);
