-- Migration: Add meetings, action items, and meeting attachments tables

CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  meeting_type TEXT DEFAULT 'chapter' CHECK(meeting_type IN ('chapter','exec','committee','special')),
  meeting_date TEXT NOT NULL,
  semester_id TEXT REFERENCES semesters(id),
  notes TEXT,
  created_by TEXT NOT NULL REFERENCES members(id),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_meetings_semester ON meetings(semester_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);

CREATE TABLE IF NOT EXISTS action_items (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  assigned_to TEXT REFERENCES members(id),
  due_date TEXT,
  status TEXT DEFAULT 'open' CHECK(status IN ('open','in_progress','completed')),
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_action_items_meeting ON action_items(meeting_id);
CREATE INDEX IF NOT EXISTS idx_action_items_assigned ON action_items(assigned_to);

CREATE TABLE IF NOT EXISTS meeting_attachments (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_key TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  uploaded_by TEXT NOT NULL REFERENCES members(id),
  created_at TEXT DEFAULT (datetime('now'))
);
