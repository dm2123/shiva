import { listCoursesDb, getStudentEnrollmentsDb, mysqlPool } from '@/lib/db';
import { cookies } from 'next/headers';
import { parseSessionCookie, validateServerSession } from '@/lib/auth';
import { deriveExamCategory } from '@/lib/exam-category';
import Link from 'next/link';
import { IconBook, IconArrowRight } from '@/components/student/StudentIcons';
import CoursesClient, { type StudentCourseItem } from './CoursesClient';

export const revalidate = 0;

function toIsoString(value: unknown): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Student Courses Catalog (PW listing parity — fix list C1/C2/C5).
 * Data wiring: listCoursesDb(false) se asal PUBLISHED courses +
 * session ki asal enrollments + Batches se har course ka sabse
 * paas wala startDate (Starts line ke liye, guarded query).
 * PW listing par page-level heading NAHI hoti — page seedha
 * controls row (search + Sort by + Filter) se shuru hota hai,
 * isliye yahan H1/count header nahi hai (C1). Card anatomy
 * CoursesClient me hai (C5).
 */
export default async function StudentCoursesPage() {
  const cookieHeader = cookies().toString();
  const sessionId = parseSessionCookie(cookieHeader);
  const session = sessionId ? await validateServerSession(sessionId) : null;
  const allCourses = await listCoursesDb(false);

  let enrolledCourseIds: string[] = [];
  if (session) {
    const enrollments = await getStudentEnrollmentsDb(session.userId);
    enrolledCourseIds = enrollments.map((e) => e.courseId);
  }

  /* Har course ka sabse paas wala batch startDate — pehle aane wala
     upcoming batch; upcoming na ho to sabse haal ka batch. DATE_FORMAT
     se 'YYYY-MM-DD' string hi aati hai (timezone ghotala nahi).
     Guarded: Batches table/query me gadbad ho to Starts line bas
     nahi dikhegi, page nahi girega. */
  const startsOnByCourse = new Map<string, string>();
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT courseId,
         DATE_FORMAT(MIN(CASE WHEN startDate >= CURDATE() THEN startDate END), '%Y-%m-%d') AS nextStart,
         DATE_FORMAT(MAX(startDate), '%Y-%m-%d') AS lastStart
       FROM Batches
       WHERE startDate IS NOT NULL
       GROUP BY courseId`,
    );
    for (const r of rows as any[]) {
      const d = r.nextStart || r.lastStart;
      if (d) startsOnByCourse.set(String(r.courseId), String(d));
    }
  } catch {
    /* Starts line optional hai — data na aaye to line nahi dikhti */
  }

  /* Client ke liye serializable roop — sirf asal fields jo asal me
     maujood hon (language/validityMonths/targetAudience purane DB
     par khaali ho sakte hain — tab woh line card par nahi dikhti) */
  const courses: StudentCourseItem[] = (allCourses as any[]).map((c) => {
    const category = deriveExamCategory(c);
    return {
      id: String(c.id),
      title: c.title,
      slug: c.slug || null,
      description: c.description || null,
      thumbnailUrl: c.thumbnailUrl || null,
      price: Number(c.price) || 0,
      language: c.language?.trim() ? c.language.trim() : null,
      validityMonths:
        c.validityMonths !== null && c.validityMonths !== undefined && Number(c.validityMonths) > 0
          ? Number(c.validityMonths)
          : null,
      targetAudience: c.targetAudience?.trim() ? c.targetAudience : null,
      createdAt: toIsoString(c.createdAt),
      startsOn: startsOnByCourse.get(String(c.id)) ?? null,
      examCategory: category ? { id: category.id, label: category.label } : null,
    };
  });

  return (
    <main className="mx-auto w-full max-w-[72rem] space-y-6 px-4 py-6 pb-10">
      {courses.length === 0 ? (
        /* Honest empty state — koi course publish hi nahi hai */
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-[0_6px_24px_rgba(42,22,80,0.06)]">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-[#6d28d9]">
            <IconBook size={24} />
          </span>
          <p className="mt-4 text-[15px] font-bold text-gray-900">Courses jald aa rahe hain</p>
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-gray-500">
            Naye courses publish hote hi yahan dikhenge. Tab tak dashboard par apni padhai jaari rakho.
          </p>
          <Link
            href="/app"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black"
          >
            Dashboard par wapas
            <IconArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <CoursesClient courses={courses} enrolledIds={enrolledCourseIds} />
      )}
    </main>
  );
}
