-- Add phone column to otp_codes for SMS OTP (separate from email OTP)
ALTER TABLE otp_codes ADD COLUMN phone TEXT;

-- Index for phone lookups
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone);
