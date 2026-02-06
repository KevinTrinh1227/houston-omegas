-- Migration: Add events and attendance tables

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'general' CHECK(event_type IN ('general','chapter','social','community_service','philanthropy','brotherhood','rush','other')),
  location TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT,
  semester_id TEXT REFERENCES semesters(id),
  is_mandatory INTEGER DEFAULT 0,
  points_value INTEGER DEFAULT 0,
  created_by TEXT NOT NULL REFERENCES members(id),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_semester ON events(semester_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_time);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES members(id),
  status TEXT DEFAULT 'absent' CHECK(status IN ('present','absent','excused','late')),
  marked_by TEXT REFERENCES members(id),
  excuse_reason TEXT,
  check_in_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(event_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_event ON attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);
