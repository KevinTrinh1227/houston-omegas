-- Migration: Roles, Permissions, and Chairs System
-- Houston Omegas - Flexible role and permission management

-- Add membership_status and eboard_position to members table
-- membership_status: active/inactive membership (payment/standing related)
-- eboard_position: executive board position (separate from role)
ALTER TABLE members ADD COLUMN membership_status TEXT DEFAULT 'active' CHECK (membership_status IN ('active', 'inactive'));
ALTER TABLE members ADD COLUMN eboard_position TEXT DEFAULT NULL CHECK (eboard_position IN ('president', 'vpi', 'vpx', 'treasurer', 'secretary', NULL));

-- Chairs table - defines available chair positions
CREATE TABLE IF NOT EXISTS available_chairs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  permissions TEXT DEFAULT '[]',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_available_chairs_name ON available_chairs(name);
CREATE INDEX IF NOT EXISTS idx_available_chairs_active ON available_chairs(is_active);

-- Member chairs junction table
CREATE TABLE IF NOT EXISTS member_chairs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  chair_name TEXT NOT NULL REFERENCES available_chairs(name) ON DELETE CASCADE,
  assigned_by TEXT REFERENCES members(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(member_id, chair_name)
);

CREATE INDEX IF NOT EXISTS idx_member_chairs_member ON member_chairs(member_id);
CREATE INDEX IF NOT EXISTS idx_member_chairs_chair ON member_chairs(chair_name);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);

-- Role permissions mapping
CREATE TABLE IF NOT EXISTS role_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_type TEXT NOT NULL CHECK (role_type IN ('role', 'chair', 'eboard')),
  role_name TEXT NOT NULL,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(role_type, role_name, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_type, role_name);
CREATE INDEX IF NOT EXISTS idx_role_permissions_perm ON role_permissions(permission_id);

-- Tags table
CREATE TABLE IF NOT EXISTS available_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6b7280',
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_available_tags_name ON available_tags(name);

-- Member tags junction table
CREATE TABLE IF NOT EXISTS member_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  tag TEXT NOT NULL REFERENCES available_tags(name) ON DELETE CASCADE,
  assigned_by TEXT REFERENCES members(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(member_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_member_tags_member ON member_tags(member_id);
CREATE INDEX IF NOT EXISTS idx_member_tags_tag ON member_tags(tag);

-- Activity feed table
CREATE TABLE IF NOT EXISTS activity_feed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id TEXT REFERENCES members(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  description TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_activity_feed_member ON activity_feed(member_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON activity_feed(created_at DESC);

-- Insert default chairs
INSERT OR IGNORE INTO available_chairs (name, display_name, description) VALUES
  ('social', 'Social Chair', 'Organizes social events and chapter gatherings'),
  ('rush', 'Rush Chair', 'Manages recruitment and rush events'),
  ('philanthropy', 'Philanthropy Chair', 'Coordinates community service activities'),
  ('historian', 'Historian', 'Documents chapter history and archives'),
  ('marketing', 'Marketing Chair', 'Handles social media and promotions'),
  ('athletics', 'Athletics Chair', 'Organizes intramural sports and events');

-- Insert default permissions
INSERT OR IGNORE INTO permissions (id, name, description, category) VALUES
  ('members.view', 'View Members', 'View member directory', 'members'),
  ('members.edit', 'Edit Members', 'Edit member profiles', 'members'),
  ('members.invite', 'Invite Members', 'Send invitations', 'members'),
  ('members.deactivate', 'Deactivate Members', 'Deactivate accounts', 'members'),
  ('members.manage_roles', 'Manage Roles', 'Assign roles', 'members'),
  ('events.view', 'View Events', 'View all events', 'events'),
  ('events.create', 'Create Events', 'Create events', 'events'),
  ('events.edit', 'Edit Events', 'Edit events', 'events'),
  ('events.delete', 'Delete Events', 'Remove events', 'events'),
  ('events.manage_attendance', 'Manage Attendance', 'Mark attendance', 'events'),
  ('finance.view', 'View Finance', 'View finances', 'finance'),
  ('finance.manage_dues', 'Manage Dues', 'Manage dues', 'finance'),
  ('finance.process_payments', 'Process Payments', 'Handle payments', 'finance'),
  ('blog.create', 'Create Blog Posts', 'Write posts', 'content'),
  ('blog.edit', 'Edit Blog Posts', 'Edit posts', 'content'),
  ('blog.publish', 'Publish Blog Posts', 'Publish posts', 'content'),
  ('announcements.manage', 'Manage Announcements', 'Manage announcements', 'content'),
  ('wiki.edit', 'Edit Wiki', 'Edit wiki', 'content'),
  ('documents.upload', 'Upload Documents', 'Upload files', 'content'),
  ('recruitment.view', 'View Recruitment', 'View submissions', 'recruitment'),
  ('recruitment.manage', 'Manage Recruitment', 'Process submissions', 'recruitment'),
  ('analytics.view', 'View Analytics', 'Access reports', 'analytics'),
  ('social_media.manage', 'Manage Social Media', 'Manage accounts', 'analytics'),
  ('admin.full_access', 'Full Admin Access', 'Full control', 'admin'),
  ('settings.manage', 'Manage Settings', 'Modify settings', 'admin'),
  ('roles.manage', 'Manage Roles', 'Configure roles', 'admin');

-- Migrate existing chair_position data
INSERT OR IGNORE INTO member_chairs (member_id, chair_name)
SELECT id, chair_position FROM members
WHERE chair_position IS NOT NULL
  AND chair_position IN ('recruitment', 'social', 'social_media', 'brotherhood', 'historian', 'alumni');

-- Map legacy chair names
UPDATE member_chairs SET chair_name = 'rush' WHERE chair_name = 'recruitment';
UPDATE member_chairs SET chair_name = 'marketing' WHERE chair_name = 'social_media';
UPDATE member_chairs SET chair_name = 'philanthropy' WHERE chair_name = 'brotherhood';

-- Migrate existing exec roles to eboard_position
UPDATE members SET eboard_position = 'president' WHERE role = 'president';
UPDATE members SET eboard_position = 'vpi' WHERE role = 'vpi';
UPDATE members SET eboard_position = 'vpx' WHERE role = 'vpx';
UPDATE members SET eboard_position = 'treasurer' WHERE role = 'treasurer';
UPDATE members SET eboard_position = 'secretary' WHERE role = 'secretary';

-- Set membership_status based on is_active
UPDATE members SET membership_status = 'inactive' WHERE is_active = 0;
UPDATE members SET membership_status = 'active' WHERE is_active = 1;

-- Insert default tags
INSERT OR IGNORE INTO available_tags (name, display_name, color, description) VALUES
  ('founding_member', 'Founding Member', '#f59e0b', 'Original founding members'),
  ('legacy', 'Legacy', '#8b5cf6', 'Family legacy in Greek life'),
  ('scholarship', 'Scholarship Recipient', '#10b981', 'Scholarship recipients'),
  ('officer', 'Former Officer', '#3b82f6', 'Previous exec position'),
  ('honor_roll', 'Honor Roll', '#ec4899', 'Academic honor roll');
