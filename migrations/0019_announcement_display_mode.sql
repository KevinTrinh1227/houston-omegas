-- Add display_mode to announcements: toast (top notification), center (centered modal), image_only (image-only centered modal)
ALTER TABLE announcements ADD COLUMN display_mode TEXT NOT NULL DEFAULT 'toast' CHECK(display_mode IN ('toast', 'center', 'image_only'));
