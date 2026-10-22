/**
 * Idempotent migration: add the Google Sign-In columns to the Users table.
 *
 * Why: the base schema (init_db_full.sql) predates Google Sign-In, so
 * production Users has no googleId / authProvider / avatarUrl columns and
 * Google login fails with "Unknown column 'googleid' in 'where clause'".
 *
 * Safe to run any number of times — every change is checked against
 * information_schema first. Works on TiDB and MySQL.
 *
 * Usage (from the repo root, with the production values):
 *   MYSQL_HOST=... MYSQL_PORT=4000 MYSQL_USER=... MYSQL_PASSWORD=... \
 *   MYSQL_DATABASE=... MYSQL_SSL=true node scripts/migrate-google-oauth.mjs
 *
 * Note: the deployed app also self-heals via src/lib/ensure-google-schema.ts
 * (same checks + ALTERs on the first Google login), so this script is the
 * manual / pre-deploy option, not a hard requirement.
 */
import mysql from 'mysql2/promise';

const COLUMNS = {
  authProvider: 'VARCHAR(32) DEFAULT NULL',
  googleId: 'VARCHAR(64) DEFAULT NULL',
  avatarUrl: 'VARCHAR(500) DEFAULT NULL',
};

const conn = await mysql.createConnection({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD ?? '',
  database: process.env.MYSQL_DATABASE || 'the_shiva',
  ...(process.env.MYSQL_SSL === 'true'
    ? { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } }
    : {}),
});

try {
  const [rows] = await conn.query(
    `SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Users'`
  );
  const have = new Set(rows.map((r) => String(r.name)));

  for (const [col, def] of Object.entries(COLUMNS)) {
    if (have.has(col)) {
      console.log(`= Users.${col} already exists, skipping`);
      continue;
    }
    await conn.query(`ALTER TABLE Users ADD COLUMN \`${col}\` ${def}`);
    have.add(col);
    console.log(`+ Users.${col} added`);
  }

  if (have.has('googleId')) {
    const [idx] = await conn.query(
      `SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Users'
          AND INDEX_NAME = 'idx_google_id' LIMIT 1`
    );
    if (idx.length) {
      console.log('= index idx_google_id already exists, skipping');
    } else {
      await conn.query('ALTER TABLE Users ADD INDEX idx_google_id (googleId)');
      console.log('+ index idx_google_id added');
    }
  }

  const [cols] = await conn.query('SHOW COLUMNS FROM Users');
  console.log('\nUsers columns now:', cols.map((c) => c.Field).join(', '));
  console.log('Migration complete.');
} finally {
  await conn.end();
}
