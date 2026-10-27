import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTeacherAssignmentsDb, findCourseByIdDb, mysqlPool } from '@/lib/db';
import { ensureTeacherAssignmentSchema } from '@/lib/ensure-teacher-assignment-schema';
import TeacherDashboardClient from './page.client';

export const metadata = {
  title: 'Teacher Workspace | The Shiva',
};

export default async function TeacherDashboard() {
  const session = await getSessionFromHeaders(headers());

  if (!session || session.role !== 'TEACHER') {
    redirect('/teacher/login');
  }

  // Fetch actual real data
  // getTeacherAssignmentsDb TeacherCourseAssignments poochta hai -
  // purane DB par table missing ho to helper error swallow karke []
  // deta hai (page khaali dikhta). Page-level leg: helper me wiring
  // nahi (db <-> ensure circular import hota).
  await ensureTeacherAssignmentSchema();
  const assignments = await getTeacherAssignmentsDb(session.userId);
  const courses = [];
  const courseStats: Record<string, any> = {};
  for (const a of assignments) {
    const c = await findCourseByIdDb(a.courseId);
    if (c) courses.push(c);

    const [subjects]: any = await mysqlPool.query('SELECT COUNT(*) AS c FROM Subjects WHERE courseId = ?', [a.courseId]);
    const [chapterRows]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS c FROM Chapters ch JOIN Subjects s ON ch.subjectId = s.id WHERE s.courseId = ?`,
      [a.courseId]
    );
    const [lectureRows]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS c FROM Lectures l JOIN Chapters ch ON l.chapterId = ch.id JOIN Subjects s ON ch.subjectId = s.id WHERE s.courseId = ?`,
      [a.courseId]
    );
    const [questionRows]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS c FROM Questions q JOIN Chapters ch ON q.chapterId = ch.id JOIN Subjects s ON ch.subjectId = s.id WHERE s.courseId = ?`,
      [a.courseId]
    );
    const [studentRows]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS c FROM StudentEnrollments WHERE courseId = ? AND status = 'ACTIVE'`,
      [a.courseId]
    );

    courseStats[a.courseId] = {
      subjects: Number(subjects[0]?.c || 0),
      chapters: Number(chapterRows[0]?.c || 0),
      lectures: Number(lectureRows[0]?.c || 0),
      questions: Number(questionRows[0]?.c || 0),
      students: Number(studentRows[0]?.c || 0),
    };
  }

  let pendingDoubts = 0;
  try {
    const courseIds = courses.map((c: any) => c.id);
    if (courseIds.length > 0) {
      const placeholders = courseIds.map(() => '?').join(', ');
      const [rows]: any = await mysqlPool.query(
        `SELECT COUNT(*) as count FROM Doubts WHERE status = 'OPEN' AND courseId IN (${placeholders})`,
        courseIds
      );
      pendingDoubts = rows[0]?.count || 0;
    }
  } catch {
    pendingDoubts = 0;
  }

  return <TeacherDashboardClient userEmail={session.email} courses={courses} pendingDoubts={pendingDoubts} courseStats={courseStats} />;
}