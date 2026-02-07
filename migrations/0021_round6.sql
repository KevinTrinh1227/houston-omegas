-- Round 6: Prospects table + Spring 2026 semester + General Meeting seeds

-- Prospects table for recruitment tracking
CREATE TABLE IF NOT EXISTS prospects (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  instagram TEXT,
  age INTEGER,
  major TEXT,
  is_uh_student INTEGER DEFAULT 1,
  status TEXT DEFAULT 'new' CHECK(status IN ('new','contacted','interested','not_interested','pledged')),
  notes TEXT,
  assigned_members TEXT DEFAULT '[]',
  created_by TEXT NOT NULL REFERENCES members(id),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_created ON prospects(created_at);

-- Create Spring 2026 semester
INSERT INTO semesters (id, name, start_date, end_date, dues_amount, is_current) VALUES (
  'spring-2026', 'Spring 2026', '2026-01-12', '2026-05-22', 15000, 1
);

-- Seed weekly General Meetings (every Monday 7PM, Feb 9 - May 18)
INSERT INTO meetings (id, title, meeting_type, meeting_date, semester_id, notes, created_by) VALUES
  (hex(randomblob(16)), 'General Meeting', 'chapter', '2026-02-09T19:00:00', 'spring-2026', 'Weekly meeting at Omega Mansion', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'),
  (hex(randomblob(16)), 'General Meeting', 'chapter', '2026-02-16T19:00:00', 'spring-2026', 'Weekly meeting at Omega Mansion', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'),
  (hex(randomblob(16)), 'General Meeting', 'chapter', '2026-02-23T19:00:00', 'spring-2026', 'Weekly meeting at Omega Mansion', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'),
  (hex(randomblob(16)), 'General Meeting', 'chapter', '2026-03-02T19:00:00', 'spring-2026', 'Weekly meeting at Omega Mansion', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'),
  (hex(randomblob(16)), 'General Meeting', 'chapter', '2026-03-09T19:00:00', 'spring-2026', 'Weekly meeting at Omega Mansion', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'),
  (hex(randomblob(16)), 'General Meeting', 'chapter', '2026-03-16T19:00:00', 'spring-2026', 'Weekly meeting at Omega Mansion', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'),
  (hex(randomblob(16)), 'General Meeting', 'chapter', '2026-03-23T19:00:00', 'spring-2026', 'Weekly meeting at Omega Mansion', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'),
  (hex(randomblob(16)), 'General Meeting', 'chapter', '2026-03-30T19:00:00', 'spring-2026', 'Weekly meeting at Omega Mansion', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'),
  (hex(randomblob(16)), 'General Meeting', 'chapter', '2026-04-06T19:00:00', 'spring-2026', 'Weekly meeting at Omega Mansion', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'),
  (hex(randomblob(16)), 'General Meeting', 'chapter', '2026-04-13T19:00:00', 'spring-2026', 'Weekly meeting at Omega Mansion', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'),
  (hex(randomblob(16)), 'General Meeting', 'chapter', '2026-04-20T19:00:00', 'spring-2026', 'Weekly meeting at Omega Mansion', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'),
  (hex(randomblob(16)), 'General Meeting', 'chapter', '2026-04-27T19:00:00', 'spring-2026', 'Weekly meeting at Omega Mansion', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'),
  (hex(randomblob(16)), 'General Meeting', 'chapter', '2026-05-04T19:00:00', 'spring-2026', 'Weekly meeting at Omega Mansion', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'),
  (hex(randomblob(16)), 'General Meeting', 'chapter', '2026-05-11T19:00:00', 'spring-2026', 'Weekly meeting at Omega Mansion', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'),
  (hex(randomblob(16)), 'General Meeting', 'chapter', '2026-05-18T19:00:00', 'spring-2026', 'Weekly meeting at Omega Mansion', 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
