import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { mysqlPool } from '@/lib/db';
import { listStudentLiveClasses } from '@/services/live-class.service';
import DashboardClient, {
  type DashboardEnrollment,
  type DashboardLiveClass,
  type DashboardStreak,
  type RecommendedCourse,
} from './page.client';

export const revalidate = 0;

// ── Helpers ──────────────────────────────────────────────────

function toISO(v: any): string | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/** Asia/Kolkata ke hisaab se YYYY-MM-DD (schedule "aaj" ke liye) */
function istDateKey(d: Date): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
  } catch {
    return d.toISOString().split('T')[0];
  }
}

/** Ek course ki resume/next lecture (asal LectureProgress se) */
async function lecturePointers(studentId: string, courseId: string) {
  let resumeLecture: { id: string; title: string } | null = null;
  let nextLecture: { id: string; title: string } | null = null;
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT l.id, l.title FROM LectureProgress lp
         JOIN Lectures l ON l.id = lp.lectureId
         JOIN Chapters ch ON ch.id = l.chapterId
         JOIN Subjects s ON s.id = ch.subjectId
        WHERE lp.studentId = ? AND s.courseId = ?
          AND lp.positionSeconds > 0
          AND (lp.isCompleted IS NULL OR lp.isCompleted = 0)
        ORDER BY lp.lastWatchedAt DESC LIMIT 1`,
      [studentId, courseId]
    );
    if (rows?.[0]) resumeLecture = { id: String(rows[0].id), title: rows[0].title };
  } catch { /* progress table na mile to pointer nahi — honest */ }
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT l.id, l.title FROM Subjects s
         JOIN Chapters ch ON ch.subjectId = s.id
         JOIN Lectures l ON l.chapterId = ch.id
         LEFT JOIN LectureProgress lp ON lp.lectureId = l.id AND lp.studentId = ?
        WHERE s.courseId = ?
          AND (lp.isCompleted IS NULL OR lp.isCompleted = 0)
        ORDER BY s.sortOrder ASC, ch.sortOrder ASC, l.sortOrder ASC LIMIT 1`,
      [studentId, courseId]
    );
    if (rows?.[0]) nextLecture = { id: String(rows[0].id), title: rows[0].title };
  } catch { /* ignore */ }
  return { resumeLecture, nextLecture };
}

// ── Page ─────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) {
    redirect('/login');
  }

  const userId = (session as any).userId as string;
  const userName = (session as any).name || session.email.split('@')[0];

  // Goal — StudentProfiles.targetExam (asal; na ho to null, koi default nahi)
  let goal: string | null = null;
  try {
    const [rows]: any = await mysqlPool.query(
      'SELECT targetExam FROM StudentProfiles WHERE userId = ? LIMIT 1',
      [userId]
    );
    goal = rows?.[0]?.targetExam || null;
  } catch { /* profile na mile to goal chip "set karo" dikhega */ }

  // Enrollments + asal lecture progress (ek aggregate query, N+1 nahi)
  let enrollments: DashboardEnrollment[] = [];
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT c.id AS courseId, c.title AS courseTitle, c.slug AS courseSlug,
              c.price AS price, b.name AS batchName, e.enrolledAt AS enrolledAt,
              COUNT(DISTINCT l.id) AS totalLectures,
              COUNT(DISTINCT CASE WHEN lp.isCompleted = 1 THEN l.id END) AS completedLectures,
              MAX(lp.lastWatchedAt) AS lastActivityAt
         FROM StudentEnrollments e
         JOIN Courses c ON e.courseId = c.id
         LEFT JOIN Batches b ON e.batchId = b.id
         LEFT JOIN Subjects s ON s.courseId = c.id
         LEFT JOIN Chapters ch ON ch.subjectId = s.id
         LEFT JOIN Lectures l ON l.chapterId = ch.id
         LEFT JOIN LectureProgress lp ON lp.lectureId = l.id AND lp.studentId = e.studentId
        WHERE e.studentId = ? AND e.status = 'ACTIVE'
        GROUP BY c.id, c.title, c.slug, c.price, b.name, e.enrolledAt
        ORDER BY (lastActivityAt IS NULL), lastActivityAt DESC, e.enrolledAt DESC`,
      [userId]
    );
    const base: DashboardEnrollment[] = (rows || []).map((r: any) => ({
      courseId: String(r.courseId),
      courseTitle: r.courseTitle,
      courseSlug: r.courseSlug,
      price: Number(r.price) || 0,
      batchName: r.batchName || null,
      enrolledAt: toISO(r.enrolledAt),
      totalLectures: Number(r.totalLectures) || 0,
      completedLectures: Number(r.completedLectures) || 0,
      resumeLecture: null,
      nextLecture: null,
    }));
    // Resume/next pointers sirf dashboard par dikhne wale pehle 4 courses ke liye
    enrollments = await Promise.all(
      base.map(async (e, i) => (i < 4 ? { ...e, ...(await lecturePointers(userId, e.courseId)) } : e))
    );
  } catch {
    enrollments = [];
  }

  // Aaj ki classes — asal live-classes service se (enrollment-aware)
  let todaysClasses: DashboardLiveClass[] = [];
  let nextClass: DashboardLiveClass | null = null;
  try {
    const all = await listStudentLiveClasses(userId);
    const mapped: DashboardLiveClass[] = (all as any[])
      .map((c: any) => ({
        id: String(c.id),
        title: c.title,
        status: c.status,
        startTime: toISO(c.scheduledStartAt || c.startTime) || '',
        meetingUrl: c.meetingUrl || null,
      }))
      .filter((c) => c.startTime);
    const todayKey = istDateKey(new Date());
    todaysClasses = mapped
      .filter((c) => c.status === 'LIVE' || (c.status === 'SCHEDULED' && istDateKey(new Date(c.startTime)) === todayKey))
      .sort((a, b) => {
        if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
        if (b.status === 'LIVE' && a.status !== 'LIVE') return 1;
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
    const todayIds = new Set(todaysClasses.map((c) => c.id));
    const future = mapped
      .filter((c) => c.status === 'SCHEDULED' && new Date(c.startTime).getTime() >= Date.now() && !todayIds.has(c.id))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    nextClass = future[0] || null;
  } catch {
    todaysClasses = [];
    nextClass = null;
  }

  // Streak — DailyStreaks se asal (/api/student/streak wali hi ginati)
  let streak: DashboardStreak | null = null;
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT streakDate FROM DailyStreaks
        WHERE studentId = ? AND streakDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ORDER BY streakDate DESC`,
      [userId]
    );
    const [totalRows]: any = await mysqlPool.query(
      'SELECT COUNT(*) AS days FROM DailyStreaks WHERE studentId = ?',
      [userId]
    );
    const dateSet = new Set<string>(
      (rows || []).map((s: any) => new Date(s.streakDate).toISOString().split('T')[0])
    );
    // Current streak: aaj ya kal se peeche gin-te hue (API route jaisi ginati)
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const check = new Date(today);
      check.setDate(check.getDate() - i);
      if (dateSet.has(check.toISOString().split('T')[0])) currentStreak++;
      else if (i > 0) break;
    }
    // Pichhle 7 din (aaj last) — label + active
    const week = Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - idx));
      const iso = d.toISOString().split('T')[0];
      return {
        label: d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'narrow' }),
        active: dateSet.has(iso) || dateSet.has(istDateKey(d)),
        isToday: idx === 6,
      };
    });
    streak = { currentStreak, totalDays: Number(totalRows?.[0]?.days) || 0, week };
  } catch {
    streak = null;
  }

  // XP — StudentXP ka asal total
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

  // Khule doubts ki ginti (badge ke liye)
  let pendingDoubts = 0;
  try {
    const [rows]: any = await mysqlPool.query(
      "SELECT COUNT(*) AS n FROM Doubts WHERE studentId = ? AND status = 'OPEN'",
      [userId]
    );
    pendingDoubts = Number(rows?.[0]?.n) || 0;
  } catch { /* badge nahi dikhega */ }

  // Recommended — asal PUBLISHED courses jinme enroll nahi hai
  let recommended: RecommendedCourse[] = [];
  try {
    const enrolledIds = new Set(enrollments.map((e) => e.courseId));
    const [rows]: any = await mysqlPool.query(
      `SELECT id, title, slug, description, price FROM Courses
        WHERE status = 'PUBLISHED' ORDER BY createdAt DESC LIMIT 12`
    );
    recommended = (rows || [])
      .filter((c: any) => !enrolledIds.has(String(c.id)))
      .slice(0, 6)
      .map((c: any) => ({
        id: String(c.id),
        title: c.title,
        slug: c.slug,
        description: c.description || null,
        price: Number(c.price) || 0,
      }));
  } catch {
    recommended = [];
  }

  return (
    <DashboardClient
      userName={userName}
      userEmail={session.email}
      goal={goal}
      enrollments={enrollments}
      todaysClasses={todaysClasses}
      nextClass={nextClass}
      streak={streak}
      totalXP={totalXP}
      pendingDoubts={pendingDoubts}
      recommended={recommended}
    />
  );
}
