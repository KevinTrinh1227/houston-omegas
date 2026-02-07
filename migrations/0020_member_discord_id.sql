-- Add discord_id field to members table
ALTER TABLE members ADD COLUMN discord_id TEXT DEFAULT NULL;
