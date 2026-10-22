/**
 * Idempotent seed: add Ajay Sir's 2 UPSSSC PET video lectures to the
 * "Aptitude Foundation - Free Course" (slug: aptitude-foundation-free).
 *
 * Lectures go into a chapter "Maths & DI — UPSSSC PET" under the
 * course's existing Quantitative Aptitude subject (created only if the
 * course has no subject at all). Safe to run any number of times —
 * every insert is preceded by an existence check (fixed ids + YouTube
 * video id match), so re-runs never duplicate.
 *
 * Usage (from the repo root, with the production values):
 *   MYSQL_HOST=... MYSQL_PORT=4000 MYSQL_USER=... MYSQL_PASSWORD=... \
 *   MYSQL_DATABASE=... MYSQL_SSL=true node scripts/seed-aptitude-pet-lectures.mjs
 *
 * Note: the deployed app also self-heals via
 * src/lib/ensure-aptitude-content.ts (same find-or-create logic on the
 * first course/learn request), so this script is the manual /
 * pre-deploy option, not a hard requirement.
 */
import mysql from 'mysql2/promise';

const COURSE_SLUG = 'aptitude-foundation-free';
const FALLBACK_SUBJECT_ID = 'ecdc3432-8602-4dcb-b029-e3ac5e1a197a';
const CHAPTER_ID = 'afbebbea-351a-4515-82d3-33a634f20bea';
const CHAPTER_TITLE = 'Maths & DI — UPSSSC PET';
const CHAPTER_DESCRIPTION =
  'UPSSSC PET 2026 ke liye Maths & Data Interpretation — previous year paper solution aur short tricks by Ajay Sir.';

const LECTURES = [
  {
    id: '554b4d0a-97cc-4595-9974-27653eff9b46',
    title: 'UPSSSC PET 2026 Maths & DI-1 | Previous Year Question Paper 2025 | Set-1',
    description:
      'UPSSSC PET 2026 ke liye Maths & Data Interpretation ka Previous Year Question Paper 2025 (Set-1) — Ajay Sir ke saath poora solution.',
    videoUrl: 'https://www.youtube.com/watch?v=WXQKyByaAo4',
    videoId: 'WXQKyByaAo4',
    sortOrder: 1,
  },
  {
    id: 'c65f53cc-fb30-4dc2-a560-014117a9782e',
    title: 'Trick #01 — Unit Digit',
    description: 'Unit Digit nikaalne ki fast short trick — Trick #01 by Ajay Sir.',
    videoUrl: 'https://www.youtube.com/watch?v=C9Y7QSj7FL0',
    videoId: 'C9Y7QSj7FL0',
    sortOrder: 2,
  },
];

const conn = await mysql.createConnection({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'the_shiva',
  ...(process.env.MYSQL_SSL === 'true'
    ? { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } }
    : {}),
});

try {
  const [courseRows] = await conn.query('SELECT id FROM Courses WHERE slug = ? LIMIT 1', [COURSE_SLUG]);
  if (!courseRows.length) {
    console.log(`Course with slug "${COURSE_SLUG}" not found — nothing to do.`);
    process.exit(0);
  }
  const courseId = courseRows[0].id;

  const [subjects] = await conn.query(
    'SELECT id, name FROM Subjects WHERE courseId = ? ORDER BY sortOrder ASC, createdAt ASC',
    [courseId]
  );
  let subject =
    subjects.find((s) => String(s.name || '').toLowerCase().includes('quant')) || subjects[0];

  if (!subject) {
    await conn.query(
      'INSERT IGNORE INTO Subjects (id, courseId, name, code, description, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, NULL, NULL, 0, NOW(), NOW())',
      [FALLBACK_SUBJECT_ID, courseId, 'Quantitative Aptitude']
    );
    subject = { id: FALLBACK_SUBJECT_ID, name: 'Quantitative Aptitude' };
    console.log('Created subject: Quantitative Aptitude');
  } else {
    console.log(`Subject: ${subject.name} (${subject.id})`);
  }

  let chapterId = null;
  const [byTitle] = await conn.query(
    'SELECT id FROM Chapters WHERE subjectId = ? AND title = ? LIMIT 1',
    [subject.id, CHAPTER_TITLE]
  );
  if (byTitle.length) {
    chapterId = byTitle[0].id;
    console.log(`Chapter already exists: ${CHAPTER_TITLE} (${chapterId})`);
  } else {
    const [maxRows] = await conn.query(
      'SELECT COALESCE(MAX(sortOrder), 0) + 1 AS nxt FROM Chapters WHERE subjectId = ?',
      [subject.id]
    );
    await conn.query(
      'INSERT IGNORE INTO Chapters (id, subjectId, title, description, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [CHAPTER_ID, subject.id, CHAPTER_TITLE, CHAPTER_DESCRIPTION, Number(maxRows[0]?.nxt || 1)]
    );
    const [check] = await conn.query(
      'SELECT id FROM Chapters WHERE id = ? OR (subjectId = ? AND title = ?) LIMIT 1',
      [CHAPTER_ID, subject.id, CHAPTER_TITLE]
    );
    chapterId = check[0]?.id;
    console.log(`Chapter ready: ${CHAPTER_TITLE} (${chapterId})`);
  }

  for (const lec of LECTURES) {
    const [existing] = await conn.query(
      'SELECT id FROM Lectures WHERE id = ? OR videoUrl LIKE ? LIMIT 1',
      [lec.id, `%${lec.videoId}%`]
    );
    if (existing.length) {
      console.log(`= Lecture already present, skipping: ${lec.title}`);
      continue;
    }
    await conn.query(
      'INSERT IGNORE INTO Lectures (id, chapterId, title, description, videoUrl, durationSeconds, isPreviewable, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 0, 1, ?, NOW(), NOW())',
      [lec.id, chapterId, lec.title, lec.description, lec.videoUrl, lec.sortOrder]
    );
    console.log(`+ Added lecture: ${lec.title}`);
  }

  console.log('Done.');
} finally {
  await conn.end();
}
