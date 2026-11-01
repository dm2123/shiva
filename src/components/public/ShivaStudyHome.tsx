import { listPublicCourses } from '@/services/academic.service';
import { listActiveEducators } from '@/services/educator.service';
import StudyHomeClient, { type StudyCourse, type StudyTeacher } from './StudyHomeClient';

/* ------------------------------------------------------------------ */
/* ShivaStudyHome — landing ka dark "study home" block (server data)  */
/* Data: listPublicCourses() (sirf published asal courses) aur        */
/* listActiveEducators() (asal active teachers). Dono me se koi bhi   */
/* fail ho to woh hissa khaali rehta hai — client honest empty state  */
/* dikhata hai, kuch invent nahi hota.                                */
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

  return <StudyHomeClient courses={courses} teachers={teachers} />;
}
