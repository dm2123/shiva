import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { mysqlPool } from '@/lib/db';
import DashboardClient, {
  type DashboardDoubtSummary,
  type DashboardEnrollment,
  type DashboardPromoCourse,
  type DashboardRecentLearning,
} from './page.client';

export const revalidate = 0;

// ── Helpers ──────────────────────────────────────────────────

function toISO(v: any): string | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

// ── Page ─────────────────────────────────────────────────────
// Dashboard v2 (PW 'Study' page ki exact sanrachna) ko sirf
// ye asal data chahiye: enrollments (My Batches ginti +
// validity alert), doubts ginti (My Doubts tile), recent
// learning (Recent Learning tile) aur asal published free
// course (promo strip). Iske alawa koi query nahi chalti.

export default async function DashboardPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) {
    redirect('/login');
  }

  const userId = (session as any).userId as string;
  const userName = (session as any).name || session.email.split('@')[0];

  // Enrollments — My Batches tile ki ginti + validity alert ka aadhaar
  let enrollments: DashboardEnrollment[] = [];
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT c.id AS courseId, c.title AS courseTitle,
              b.name AS batchName, b.endDate AS batchEndDate,
              e.enrolledAt AS enrolledAt
         FROM StudentEnrollments e
         JOIN Courses c ON e.courseId = c.id
         LEFT JOIN Batches b ON e.batchId = b.id
        WHERE e.studentId = ? AND e.status = 'ACTIVE'
        ORDER BY e.enrolledAt DESC`,
      [userId]
    );
    // Course validity (Courses.validityMonths) — column purane DB par na bhi
    // ho sakta hai, isliye alag best-effort query; na mile to null (alert nahi).
    const validityByCourse = new Map<string, number | null>();
    try {
      const ids = (rows || []).map((r: any) => String(r.courseId));
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
    } catch { /* validity column nahi — batch endDate hi alert ka aadhaar */ }
    enrollments = (rows || []).map((r: any) => ({
      courseId: String(r.courseId),
      courseTitle: r.courseTitle,
      batchName: r.batchName || null,
      enrolledAt: toISO(r.enrolledAt),
      batchEndDate: toISO(r.batchEndDate),
      validityMonths: validityByCourse.get(String(r.courseId)) ?? null,
    }));
  } catch {
    enrollments = [];
  }

  // My Doubts tile ke liye asal ginti (kul / khule / hal hue)
  let doubtSummary: DashboardDoubtSummary = { total: 0, open: 0, resolved: 0 };
  try {
    const [counts]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) AS openCount,
              SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolvedCount
         FROM Doubts WHERE studentId = ?`,
      [userId]
    );
    doubtSummary = {
      total: Number(counts?.[0]?.total) || 0,
      open: Number(counts?.[0]?.openCount) || 0,
      resolved: Number(counts?.[0]?.resolvedCount) || 0,
    };
  } catch { /* ginti na mile to tile imaandaar default sub-line dikhayega */ }

  // Recent Learning — LectureProgress ki sabse taza asal activity
  let recentLearning: DashboardRecentLearning[] = [];
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT l.id AS lectureId, l.title AS lectureTitle,
              c.id AS courseId, c.title AS courseTitle,
              lp.isCompleted AS isCompleted, lp.lastWatchedAt AS lastWatchedAt
         FROM LectureProgress lp
         JOIN Lectures l ON l.id = lp.lectureId
         JOIN Chapters ch ON ch.id = l.chapterId
         JOIN Subjects s ON s.id = ch.subjectId
         JOIN Courses c ON c.id = s.courseId
        WHERE lp.studentId = ? AND lp.lastWatchedAt IS NOT NULL
        ORDER BY lp.lastWatchedAt DESC LIMIT 3`,
      [userId]
    );
    recentLearning = (rows || []).map((r: any) => ({
      lectureId: String(r.lectureId),
      lectureTitle: r.lectureTitle,
      courseId: String(r.courseId),
      courseTitle: r.courseTitle,
      isCompleted: !!r.isCompleted,
      lastWatchedAt: toISO(r.lastWatchedAt),
    }));
  } catch { /* asal activity na mile to tile imaandaar default sub-line dikhayega */ }

  // Promo carousel — asal PUBLISHED free courses (Aptitude Foundation
  // ho to wahi pehle), zyada se zyada 3; koi free course publish na
  // ho to carousel hi nahi dikhega.
  let promoCourses: DashboardPromoCourse[] = [];
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT id, title, slug FROM Courses
        WHERE status = 'PUBLISHED' AND COALESCE(price, 0) = 0
        ORDER BY (title LIKE '%Aptitude Foundation%') DESC, createdAt DESC
        LIMIT 3`
    );
    promoCourses = (rows || []).map((r: any) => ({
      id: String(r.id),
      title: r.title,
      slug: r.slug || null,
    }));
  } catch { /* course data na mile to promo carousel nahi dikhega */ }

  // Header-row chips — asal streak (DailyStreaks) aur XP (StudentXP),
  // layout wali hi ginati. Load na ho to null — chip nahi dikhega.
  let streak: number | null = null;
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT streakDate FROM DailyStreaks
        WHERE studentId = ? AND streakDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ORDER BY streakDate DESC`,
      [userId]
    );
    const dateSet = new Set<string>(
      (rows || []).map((s: any) => new Date(s.streakDate).toISOString().split('T')[0])
    );
    let current = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const check = new Date(today);
      check.setDate(check.getDate() - i);
      if (dateSet.has(check.toISOString().split('T')[0])) current++;
      else if (i > 0) break;
    }
    streak = current;
  } catch {
    streak = null;
  }

  let totalXP: number | null = null;
  try {
    const [rows]: any = await mysqlPool.query(
      'SELECT COALESCE(SUM(points), 0) AS total FROM StudentXP WHERE studentId = ?',
      [userId]
    );
    totalXP = Number(rows?.[0]?.total) || 0;
  } catch {
    totalXP = null;
  }

  return (
    <DashboardClient
      userName={userName}
      enrollments={enrollments}
      doubtSummary={doubtSummary}
      recentLearning={recentLearning}
      promoCourses={promoCourses}
      streak={streak}
      totalXP={totalXP}
    />
  );
}
