-- Google OAuth: Add googleId column to Users table
ALTER TABLE Users ADD COLUMN IF NOT EXISTS googleId VARCHAR(64) DEFAULT NULL AFTER authProvider;

-- Add index for fast googleId lookups
ALTER TABLE Users ADD INDEX IF NOT EXISTS idx_google_id (googleId);
