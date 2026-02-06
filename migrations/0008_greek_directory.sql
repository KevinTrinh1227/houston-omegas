-- Migration: Add Greek organization directory and mixer events tables

CREATE TABLE IF NOT EXISTS greek_orgs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  letters TEXT NOT NULL,
  council TEXT NOT NULL CHECK(council IN ('IFC','NPHC','MGC','PHC','LGC','Independent','Other')),
  chapter TEXT,
  instagram TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  notes TEXT,
  is_active INTEGER DEFAULT 1,
  created_by TEXT NOT NULL REFERENCES members(id),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_greek_orgs_council ON greek_orgs(council);

CREATE TABLE IF NOT EXISTS mixer_events (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES greek_orgs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  location TEXT,
  description TEXT,
  semester_id TEXT REFERENCES semesters(id),
  created_by TEXT NOT NULL REFERENCES members(id),
  created_at TEXT DEFAULT (datetime('now'))
);
