import { listCoursesDb, getStudentEnrollmentsDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { parseSessionCookie, validateServerSession } from '@/lib/auth';
import Link from 'next/link';
import { IconBook, IconArrowRight } from '@/components/student/StudentIcons';
import CoursesClient, { type StudentCourseItem } from './CoursesClient';

export const revalidate = 0;

/**
 * Student Courses Catalog (Wave B1 — PW catalog parity).
 * Data wiring pehle jaisi hi hai: listCoursesDb(false) se asal
 * PUBLISHED courses + session ki asal enrollments. Presentation
 * PW catalog ki hai: bada 'Courses' title, gol search bar aur
 * bade banner cards (CoursesClient) — price/CTA enrollment state
 * ke hisaab se. Purana gradient hero strip aur gradient-cover
 * cards PW catalog par nahi hain, isliye hata diye gaye.
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

  /* Client ke liye serializable roop — sirf asal fields jo asal me
     maujood hon (language/validityMonths/targetAudience purane DB
     par khaali ho sakte hain — tab woh line card par nahi dikhti) */
  const courses: StudentCourseItem[] = (allCourses as any[]).map((c) => ({
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
  }));

  return (
    <main className="mx-auto w-full max-w-[72rem] space-y-6 px-4 py-6 pb-10">
      {/* ── Page header — PW catalog pattern: bada title + count line ── */}
      <div>
        <h1 className="text-[28px] font-extrabold leading-tight text-gray-900">Courses</h1>
        <p className="mt-1 text-[13.5px] leading-relaxed text-gray-500">
          {courses.length > 0
            ? `${courses.length} published course${courses.length === 1 ? '' : 's'} — apne exam ka course chuno aur taiyaari shuru karo.`
            : 'Published courses yahan dikhenge.'}
        </p>
      </div>

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
