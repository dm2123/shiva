import { headers } from 'next/headers';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import BatchesClient, { type BatchCardData } from './BatchesClient';

export const revalidate = 0;

export default async function BatchesPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  // Real enrolled batches for this student.
  // c.price sirf Paid | Free segmented control ki classification ke liye
  // hai (price > 0 = Paid, 0/NULL = Free) — asal column, koi invent nahi.
  // F7 (3 Nov fix list): Batches par LEFT JOIN — jis enrollment ka
  // batchId NULL hai (sirf course enroll, koi batch nahi) woh bhi asal
  // enrolled course hai, isliye My Batches me dikhna chahiye. Pehle
  // inner join use chhupakar hata deta tha (khaas karke Free segment
  // khaali dikhne ki ek wajah). Aise rows me mapping neeche batch
  // fields ki jagah course/enrollment ke asal fields leti hai.
  const [rows]: any = await mysqlPool.query(
    `SELECT b.id, b.name, b.status, b.startDate, b.endDate,
            c.id AS courseId, c.title AS courseTitle, c.thumbnailUrl AS courseThumbnail,
            c.price AS coursePrice, e.id AS enrollmentId, e.enrolledAt AS enrolledAt,
            tp.name AS teacherName
       FROM StudentEnrollments e
       LEFT JOIN Batches b ON e.batchId = b.id
       JOIN Courses c ON e.courseId = c.id
       LEFT JOIN TeacherProfiles tp ON b.teacherId = tp.userId
      WHERE e.studentId = ? AND e.status = 'ACTIVE'
      ORDER BY COALESCE(b.createdAt, e.enrolledAt) DESC`,
    [session.userId]
  );
  const batches: any[] = rows || [];

  // Course validity (Courses.validityMonths) — column purane DB par na bhi
  // ho sakta hai, isliye dashboard wala best-effort alag-query pattern.
  // All | Expired tabs me Expired ka dusra aadhaar (pehla = batch endDate).
  const validityByCourse = new Map<string, number | null>();
  try {
    const ids = Array.from(new Set(batches.map((b) => String(b.courseId))));
    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      const [vrows]: any = await mysqlPool.query(
        `SELECT id, validityMonths FROM Courses WHERE id IN (${placeholders})`,
        ids
      );
      for (const v of vrows || []) {
        validityByCourse.set(String(v.id), v.validityMonths != null ? Number(v.validityMonths) : null);
      }
    }
  } catch { /* validity column nahi — batch endDate hi expiry ka aadhaar */ }

  // Client component ke liye serializable roop (dates → ISO string).
  // Course-only enrollment (b.id NULL) me: card id = enrollment id,
  // title = course title hi (batch name maujood nahi), status = 'ACTIVE'
  // (enrollment ki asal status — query e.status='ACTIVE' par hi filter
  // hai). Dates/teacher NULL rahenge — client unhe imaandaari se
  // khaali/'To be assigned' dikhata hai, kuch invent nahi hota.
  const batchData: BatchCardData[] = batches.map((b) => ({
    id: String(b.id ?? b.enrollmentId),
    name: b.name ?? b.courseTitle,
    status: b.status ?? 'ACTIVE',
    startDate: b.startDate ? new Date(b.startDate).toISOString() : null,
    endDate: b.endDate ? new Date(b.endDate).toISOString() : null,
    courseId: String(b.courseId),
    courseTitle: b.courseTitle,
    courseThumbnail: b.courseThumbnail ?? null,
    teacherName: b.teacherName ?? null,
    coursePrice: b.coursePrice != null ? Number(b.coursePrice) : null,
    enrolledAt: b.enrolledAt ? new Date(b.enrolledAt).toISOString() : null,
    validityMonths: validityByCourse.get(String(b.courseId)) ?? null,
  }));

  return (
    <main className="mx-auto w-full max-w-[72rem] space-y-5 px-4 py-5 pb-10">
      {/* ── My Batches — PW anatomy: ek bade safed card ke andar
          28px title, phir client ke andar Paid | Free segmented
          control, All | Expired tabs aur grid / empty state.
          Batches 0 hon tab bhi wahi structure dikhta hai (PW ke
          empty screenshot jaisa) — isliye BatchesClient hamesha
          render hota hai. ──────────────────────────────────── */}
      <section
        aria-label="My Batches"
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)] sm:p-7"
      >
        <h1 className="text-[28px] font-extrabold leading-tight text-gray-900">My Batches</h1>
        <div className="mt-6">
          <BatchesClient batches={batchData} />
        </div>
      </section>
    </main>
  );
}
