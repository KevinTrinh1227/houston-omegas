-- Migration: Add semesters, dues, and payments tables for finance tracking

CREATE TABLE IF NOT EXISTS semesters (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  dues_amount INTEGER NOT NULL, -- cents
  is_current INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dues (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id),
  semester_id TEXT NOT NULL REFERENCES semesters(id),
  amount_due INTEGER NOT NULL,
  amount_paid INTEGER DEFAULT 0,
  status TEXT DEFAULT 'unpaid' CHECK(status IN ('unpaid','partial','paid','waived','exempt')),
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(member_id, semester_id)
);

CREATE INDEX IF NOT EXISTS idx_dues_member ON dues(member_id);
CREATE INDEX IF NOT EXISTS idx_dues_semester ON dues(semester_id);
CREATE INDEX IF NOT EXISTS idx_dues_status ON dues(status);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  dues_id TEXT NOT NULL REFERENCES dues(id),
  member_id TEXT NOT NULL REFERENCES members(id),
  amount INTEGER NOT NULL,
  method TEXT DEFAULT 'other' CHECK(method IN ('cash','venmo','zelle','check','other')),
  recorded_by TEXT NOT NULL REFERENCES members(id),
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payments_dues ON payments(dues_id);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
