-- Add chair_position column to members table
-- Values: recruitment, alumni, social, social_media, brotherhood, or NULL
ALTER TABLE members ADD COLUMN chair_position TEXT DEFAULT NULL;
