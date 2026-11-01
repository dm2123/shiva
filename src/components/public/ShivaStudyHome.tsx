import { listPublicCourses } from '@/services/academic.service';
import { listActiveEducators } from '@/services/educator.service';
import { mysqlPool } from '@/lib/db';
import StudyHomeClient, {
  type StudyCourse,
  type StudyTeacher,
} from './StudyHomeClient';

/* ------------------------------------------------------------------ */
/* ShivaStudyHome — student study home (server data)                  */
/* Data: listPublicCourses() (sirf published asal courses),           */
/* listActiveEducators() (asal active teachers) aur Batches table     */
/* (exam tiles ke liye). Koi bhi hissa fail ho to woh khaali rehta    */
/* hai — client honest empty state dikhata hai, kuch invent nahi      */
/* hota.                                                              */
/*                                                                    */
/* "Study Material" tiles FIXED list nahi hain: tile sirf tab banta   */
/* hai jab us exam ka asal course ya batch data me maujood ho.        */
/* Batch wala exam seedha /batches?exam=… par jata hai; sirf          */
/* course wala exam /courses par (wahan apna category filter hai).    */
/* ------------------------------------------------------------------ */

function parseSubjects(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (!t) return [];
    try {
      const parsed = JSON.parse(t);
      if (Array.isArray(parsed)) return parsed.map(String).map((s) => s.trim()).filter(Boolean);
    } catch {
      /* plain comma string */
    }
    return t.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/* Batch exam rules — public /batches page ke deriveExam wali hi soch:
   tag sirf batch/course ke asal naam-slug se banta hai, warna kuch nahi. */
const BATCH_EXAM_RULES: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bssc\b|\bcgl\b|\bchsl\b|\bmts\b|ssc\s*gd/i, label: 'SSC' },
  { pattern: /railway|\brrb\b|\bntpc\b|group\s*d/i, label: 'Railway' },
  { pattern: /bank|\bibps\b|\bsbi\b/i, label: 'Banking' },
  { pattern: /\bctet\b|\btet\b|teaching|teacher|\bkvs\b|\bdsssb\b/i, label: 'Teaching' },
  { pattern: /defence|defense|\bnda\b|\bcds\b|\bafcat\b/i, label: 'Defence' },
  { pattern: /\bupsc\b|\bias\b|\bpcs\b|civil\s*service/i, label: 'UPSC' },
  { pattern: /\bneet\b/i, label: 'NEET' },
  { pattern: /\bjee\b/i, label: 'JEE' },
];

async function getBatchExamLabels(): Promise<Set<string>> {
  const labels = new Set<string>();
  try {
    const [rows]: any = await mysqlPool.query(`
      SELECT b.name AS name, c.title AS courseTitle, c.slug AS courseSlug
      FROM Batches b
      LEFT JOIN Courses c ON b.courseId = c.id
    `);
    for (const r of rows || []) {
      const haystack = `${r.name || ''} ${r.courseTitle || ''} ${r.courseSlug || ''}`;
      for (const rule of BATCH_EXAM_RULES) {
        if (rule.pattern.test(haystack)) {
          labels.add(rule.label);
          break;
        }
      }
    }
  } catch {
    /* batches na milein to tiles sirf courses se bante hain */
  }
  return labels;
}

export default async function ShivaStudyHome() {
  let courses: StudyCourse[] = [];
  try {
    const rows = await listPublicCourses();
    courses = rows.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      price: Number(c.price) || 0,
      thumbnailUrl: c.thumbnailUrl,
      educatorId: c.educatorId,
      language: c.language,
    }));
  } catch {
    courses = [];
  }

  let teachers: StudyTeacher[] = [];
  try {
    const rows = await listActiveEducators();
    teachers = rows
      .filter((t) => t && (t.displayName || (t as { name?: string }).name))
      .slice(0, 10)
      .map((t) => ({
        id: t.id,
        displayName: t.displayName || (t as { name?: string }).name || '',
        slug: t.slug,
        logoUrl: t.logoUrl,
        subjects: [...parseSubjects(t.subjects), ...parseSubjects(t.specialties)],
      }));
  } catch {
    teachers = [];
  }

  /* Batch exams — tiles client me courses ki categories se milkar bante
     hain; yahan sirf asal batch data se derive hue exam labels jate hain. */
  const batchLabels = await getBatchExamLabels();

  return (
    <StudyHomeClient courses={courses} teachers={teachers} batchExams={Array.from(batchLabels)} />
  );
}
