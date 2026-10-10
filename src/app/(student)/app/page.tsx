import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { mysqlPool } from '@/lib/db';
import DashboardClient, { DashboardEnrollment, DashboardLiveClass } from './page.client';

export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) {
    redirect('/login');
  }

  const [enrollmentRows]: any = await mysqlPool.query(
    `SELECT e.courseId, c.title AS courseTitle, c.slug AS courseSlug, c.price,
            b.name AS batchName, e.enrolledAt,
            (SELECT COUNT(*) FROM Lectures l
               JOIN Chapters ch ON l.chapterId = ch.id
               JOIN Subjects s ON ch.subjectId = s.id
             WHERE s.courseId = e.courseId) AS totalLectures,
            (SELECT COUNT(*) FROM LectureProgress lp
               JOIN Lectures l2 ON lp.lectureId = l2.id
               JOIN Chapters ch2 ON l2.chapterId = ch2.id
               JOIN Subjects s2 ON ch2.subjectId = s2.id
             WHERE s2.courseId = e.courseId AND lp.studentId = e.studentId AND lp.isCompleted = 1) AS completedLectures
       FROM StudentEnrollments e
       JOIN Courses c ON e.courseId = c.id
       LEFT JOIN Batches b ON e.batchId = b.id
      WHERE e.studentId = ? AND e.status = 'ACTIVE'
      ORDER BY e.enrolledAt DESC`,
    [session.userId]
  );

  const [liveRows]: any = await mysqlPool.query(
    `SELECT id, title, startTime, meetingUrl, status
       FROM LiveClasses
      WHERE status IN ('SCHEDULED', 'LIVE') AND startTime >= NOW()
      ORDER BY startTime ASC
      LIMIT 3`
  );

  const [doubtRows]: any = await mysqlPool.query(
    `SELECT COUNT(*) AS count FROM Doubts WHERE studentId = ? AND status = 'OPEN'`,
    [session.userId]
  );

  const enrollments: DashboardEnrollment[] = (enrollmentRows || []).map((e: any) => ({
    courseId: e.courseId,
    courseTitle: e.courseTitle,
    courseSlug: e.courseSlug,
    price: Number(e.price),
    batchName: e.batchName || null,
    totalLectures: Number(e.totalLectures),
    completedLectures: Number(e.completedLectures),
  }));

  const liveClasses: DashboardLiveClass[] = (liveRows || []).map((l: any) => ({
    id: l.id,
    title: l.title,
    startTime: new Date(l.startTime).toISOString(),
    meetingUrl: l.meetingUrl || null,
    status: l.status,
  }));

  return (
    <DashboardClient
      userEmail={session.email}
      enrollments={enrollments}
      upcomingLiveClasses={liveClasses}
      pendingDoubts={Number(doubtRows[0]?.count || 0)}
    />
  );
}