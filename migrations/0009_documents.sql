-- Migration: Add document categories and documents tables

CREATE TABLE IF NOT EXISTS document_categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES document_categories(id),
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_key TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  parent_id TEXT REFERENCES documents(id),
  uploaded_by TEXT NOT NULL REFERENCES members(id),
  visibility TEXT DEFAULT 'members' CHECK(visibility IN ('exec','members')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_parent ON documents(parent_id);
