import { mysqlPool } from '@/lib/db';

/**
 * Aptitude Foundation (free) — UPSSSC PET Maths & DI lectures.
 *
 * The production database is provisioned directly via SQL, and the
 * course's first lecture ("Time & Work — Class 1") was added to MySQL
 * by hand. These two lectures by Ajay Sir were shared afterwards, so
 * they are seeded here following the same self-heal pattern as
 * ensure-google-schema.ts: on the first relevant request after deploy,
 * the rows are find-or-created in the real Subjects → Chapters →
 * Lectures tables. Both the website (server components / syllabus
 * tree) and the mobile app (student APIs) read those tables, so the
 * lectures appear in both automatically.
 *
 * Idempotent: the chapter and lectures use fixed ids and every insert
 * is preceded by an existence check (by id, and by YouTube video id in
 * the videoUrl). This function NEVER throws — a seed failure must not
 * break course pages or APIs.
 */

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
    description:
      'Unit Digit nikaalne ki fast short trick — Trick #01 by Ajay Sir.',
    videoUrl: 'https://www.youtube.com/watch?v=C9Y7QSj7FL0',
    videoId: 'C9Y7QSj7FL0',
    sortOrder: 2,
  },
];

let attempted: Promise<void> | null = null;

export function ensureAptitudePetLectures(): Promise<void> {
  if (!attempted) {
    attempted = seed().catch((e: any) => {
      // Never break the caller; a later process gets a fresh attempt.
      console.error('[aptitude-content] seed failed:', e?.message);
    });
  }
  return attempted;
}

async function seed(): Promise<void> {
  const [courseRows]: any = await mysqlPool.query(
    'SELECT id FROM Courses WHERE slug = ? LIMIT 1',
    [COURSE_SLUG]
  );
  const course = courseRows?.[0];
  if (!course) return;

  // Subject: prefer the existing Quantitative Aptitude subject; fall
  // back to the first subject; create one only if the course has none.
  const [subjects]: any = await mysqlPool.query(
    'SELECT id, name FROM Subjects WHERE courseId = ? ORDER BY sortOrder ASC, createdAt ASC',
    [course.id]
  );
  let subject = (subjects || []).find((s: any) =>
    String(s.name || '').toLowerCase().includes('quant')
  ) || (subjects || [])[0];

  if (!subject) {
    await mysqlPool.query(
      'INSERT IGNORE INTO Subjects (id, courseId, name, code, description, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, NULL, NULL, 0, NOW(), NOW())',
      [FALLBACK_SUBJECT_ID, course.id, 'Quantitative Aptitude']
    );
    subject = { id: FALLBACK_SUBJECT_ID, name: 'Quantitative Aptitude' };
  }

  // Chapter: find-or-create "Maths & DI — UPSSSC PET" under the subject.
  let chapterId: string | null = null;
  const [byTitle]: any = await mysqlPool.query(
    'SELECT id FROM Chapters WHERE subjectId = ? AND title = ? LIMIT 1',
    [subject.id, CHAPTER_TITLE]
  );
  if (byTitle?.[0]) {
    chapterId = byTitle[0].id;
  } else {
    const [maxRows]: any = await mysqlPool.query(
      'SELECT COALESCE(MAX(sortOrder), 0) + 1 AS nxt FROM Chapters WHERE subjectId = ?',
      [subject.id]
    );
    await mysqlPool.query(
      'INSERT IGNORE INTO Chapters (id, subjectId, title, description, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [CHAPTER_ID, subject.id, CHAPTER_TITLE, CHAPTER_DESCRIPTION, Number(maxRows?.[0]?.nxt || 1)]
    );
    const [check]: any = await mysqlPool.query(
      'SELECT id FROM Chapters WHERE id = ? OR (subjectId = ? AND title = ?) LIMIT 1',
      [CHAPTER_ID, subject.id, CHAPTER_TITLE]
    );
    chapterId = check?.[0]?.id || null;
  }
  if (!chapterId) return;

  // Lectures: insert only when neither the fixed id nor the same
  // YouTube video is already present anywhere in this course chapter.
  for (const lec of LECTURES) {
    const [existing]: any = await mysqlPool.query(
      'SELECT id FROM Lectures WHERE id = ? OR videoUrl LIKE ? LIMIT 1',
      [lec.id, `%${lec.videoId}%`]
    );
    if (existing?.length) continue;
    await mysqlPool.query(
      'INSERT IGNORE INTO Lectures (id, chapterId, title, description, videoUrl, durationSeconds, isPreviewable, sortOrder, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 0, 1, ?, NOW(), NOW())',
      [lec.id, chapterId, lec.title, lec.description, lec.videoUrl, lec.sortOrder]
    );
    console.log(`[aptitude-content] added lecture "${lec.title}" to chapter ${chapterId}`);
  }
}
