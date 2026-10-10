/**
 * Auto-seed is disabled — the database is provisioned directly via SQL:
 *   init_db_full.sql  (schema, 22 tables)
 *   seed_db.sql       (brand-aligned demo data: courses, teachers, batches, students)
 *
 * The previous simulation auto-seed (seed.ts) targeted tables
 * (organizations, educatorprofiles) that no longer exist in the current schema,
 * so it is intentionally a no-op.
 */
export async function ensureSeed() {
  // no-op — real seed data is already committed to MySQL.
}