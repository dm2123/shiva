-- Google OAuth: columns used by /api/public/auth/google on the Users table.
--
-- The base schema (init_db_full.sql) predates Google Sign-In and has NONE of
-- these columns on Users — without them, Google login fails at the last step
-- with "Unknown column 'googleid' in 'where clause'".
--
-- Idempotent on TiDB (production). MySQL 8 does not support
-- ADD COLUMN IF NOT EXISTS — on MySQL run scripts/migrate-google-oauth.mjs
-- instead. Note: the app also self-heals — src/lib/ensure-google-schema.ts
-- adds any missing column automatically on the first Google login after a
-- deploy, so applying this file manually is a belt-and-braces step.

ALTER TABLE Users ADD COLUMN IF NOT EXISTS authProvider VARCHAR(32) DEFAULT NULL;

ALTER TABLE Users ADD COLUMN IF NOT EXISTS googleId VARCHAR(64) DEFAULT NULL AFTER authProvider;

ALTER TABLE Users ADD COLUMN IF NOT EXISTS avatarUrl VARCHAR(500) DEFAULT NULL;

-- Add index for fast googleId lookups
ALTER TABLE Users ADD INDEX IF NOT EXISTS idx_google_id (googleId);
