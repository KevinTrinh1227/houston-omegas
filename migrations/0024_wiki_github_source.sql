-- Migration: Add GitHub source tracking to wiki pages
ALTER TABLE wiki_pages ADD COLUMN source TEXT DEFAULT 'manual';
ALTER TABLE wiki_pages ADD COLUMN github_path TEXT;
ALTER TABLE wiki_pages ADD COLUMN github_sha TEXT;
