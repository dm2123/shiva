import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { TeacherPageHeader, TeacherGlassPanel } from '@/components/teacher/TeacherShared';
import TeacherEmptyState from '@/components/teacher/TeacherEmptyState';
import { getTeacherAssignmentsDb, mysqlPool } from '@/lib/db';
import { ensureTeacherAssignmentSchema } from '@/lib/ensure-teacher-assignment-schema';

export const metadata = {
  title: 'Analytics | The Shiva',
};

export default async function TeacherAnalytics() {
  const session = await getSessionFromHeaders(headers());

  if (!session || session.role !== 'TEACHER') {
    redirect('/teacher/login');
  }

  // getTeacherAssignmentsDb TeacherCourseAssignments poochta hai -
  // purane DB par table missing ho to helper error swallow karke []
  // deta hai (page khaali dikhta). Page-level leg: helper me wiring
  // nahi (db <-> ensure circular import hota).
  await ensureTeacherAssignmentSchema();
  const assignments = await getTeacherAssignmentsDb(session.userId);
  const courseIds = assignments.map((a: any) => a.courseId);

  let stats = {
    students: 0,
    lectures: 0,
    questions: 0,
    tests: 0,
    attempts: 0,
    avgScore: 0,
    openDoubts: 0,
    resolvedDoubts: 0,
  };
  let perCourse: any[] = [];

  if (courseIds.length > 0) {
    const placeholders = courseIds.map(() => '?').join(', ');

    const [students]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS c FROM StudentEnrollments WHERE courseId IN (${placeholders}) AND status = 'ACTIVE'`, courseIds);
    const [lectures]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS c FROM Lectures l JOIN Chapters ch ON l.chapterId = ch.id JOIN Subjects s ON ch.subjectId = s.id WHERE s.courseId IN (${placeholders})`, courseIds);
    const [questions]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS c FROM Questions q JOIN Chapters ch ON q.chapterId = ch.id JOIN Subjects s ON ch.subjectId = s.id WHERE s.courseId IN (${placeholders})`, courseIds);
    const [tests]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS c FROM Tests WHERE courseId IN (${placeholders})`, courseIds);
    const [attempts]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS c FROM AssessmentAttempts aa JOIN Tests t ON aa.assessmentId = t.id WHERE t.courseId IN (${placeholders})`, courseIds);
    const [scoreRow]: any = await mysqlPool.query(
      `SELECT AVG(aa.score) AS avgScore FROM AssessmentAttempts aa JOIN Tests t ON aa.assessmentId = t.id WHERE t.courseId IN (${placeholders}) AND aa.status != 'STARTED'`, courseIds);
    const [doubts]: any = await mysqlPool.query(
      `SELECT status, COUNT(*) AS c FROM Doubts WHERE courseId IN (${placeholders}) GROUP BY status`, courseIds);

    stats = {
      students: Number(students[0]?.c || 0),
      lectures: Number(lectures[0]?.c || 0),
      questions: Number(questions[0]?.c || 0),
      tests: Number(tests[0]?.c || 0),
      attempts: Number(attempts[0]?.c || 0),
      avgScore: Math.round(Number(scoreRow[0]?.avgScore || 0)),
      openDoubts: 0,
      resolvedDoubts: 0,
    };
    for (const d of doubts || []) {
      if (d.status === 'OPEN') stats.openDoubts = Number(d.c);
      else stats.resolvedDoubts += Number(d.c);
    }

    const [rows]: any = await mysqlPool.query(
      `SELECT c.id, c.title,
              (SELECT COUNT(*) FROM StudentEnrollments WHERE courseId = c.id AND status = 'ACTIVE') AS students,
              (SELECT COUNT(*) FROM Lectures l JOIN Chapters ch ON l.chapterId = ch.id JOIN Subjects s ON ch.subjectId = s.id WHERE s.courseId = c.id) AS lectures,
              (SELECT COUNT(*) FROM Questions q JOIN Chapters ch ON q.chapterId = ch.id JOIN Subjects s ON ch.subjectId = s.id WHERE s.courseId = c.id) AS questions,
              (SELECT COUNT(*) FROM Tests WHERE courseId = c.id) AS tests,
              (SELECT COUNT(DISTINCT aa.studentId) FROM AssessmentAttempts aa JOIN Tests t ON aa.assessmentId = t.id WHERE t.courseId = c.id AND aa.status = 'EVALUATED') AS attempters,
              (SELECT AVG(aa.score) FROM AssessmentAttempts aa JOIN Tests t ON aa.assessmentId = t.id WHERE t.courseId = c.id AND aa.status != 'STARTED') AS avgScore
         FROM Courses c
        WHERE c.id IN (${placeholders})
        ORDER BY students DESC`,
      courseIds
    );
    perCourse = rows || [];
  }

  const maxStudents = Math.max(1, ...perCourse.map((c: any) => Number(c.students || 0)));
  const hasData = assignments.length > 0;

  const cards = [
    { label: 'Active Students', value: stats.students, accent: 'text-teal-600' },
    { label: 'Lecture Library', value: stats.lectures, accent: 'text-indigo-600' },
    { label: 'Question Bank', value: stats.questions, accent: 'text-pink-600' },
    { label: 'Published Tests', value: stats.tests, accent: 'text-amber-600' },
    { label: 'Attempts Evaluated', value: stats.attempts, accent: 'text-emerald-600' },
    { label: 'Avg Score', value: stats.avgScore, accent: 'text-cyan-600', suffix: ' /100' },
    { label: 'Open Doubts', value: stats.openDoubts, accent: 'text-orange-600' },
    { label: 'Resolved Doubts', value: stats.resolvedDoubts, accent: 'text-lime-600' },
  ];

  return (
    <div className="relative">
      <TeacherPageHeader
        title="Performance Analytics"
        description="Data-driven insights into your classroom engagement and content performance."
      />

      {!hasData ? (
        <div className="mt-8">
          <TeacherEmptyState
            illustrationType="analytics"
            title="No Assigned Courses"
            description="You need to be assigned a course before engagement analytics can be generated."
          />
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((k) => (
              <TeacherGlassPanel key={k.label} className="p-5">
                <p className={`text-3xl font-black ${k.accent}`}>{k.value}{k.suffix ? <span className="text-lg">{k.suffix}</span> : null}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--teacher-text-muted)] mt-1">{k.label}</p>
              </TeacherGlassPanel>
            ))}
          </div>

          <TeacherGlassPanel className="p-6">
            <h3 className="text-lg font-bold text-[var(--teacher-text)] mb-6">Course Engagement</h3>
            {perCourse.length === 0 ? (
              <p className="text-sm text-[var(--teacher-text-muted)]">No engagement data recorded yet.</p>
            ) : (
              <div className="space-y-6">
                {perCourse.map((c: any) => {
                  const students = Number(c.students || 0);
                  const avg = c.avgScore != null ? Math.round(Number(c.avgScore)) : null;
                  return (
                    <div key={c.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                        <h4 className="font-bold text-[var(--teacher-text)] text-sm">{c.title}</h4>
                        <span className="text-xs text-[var(--teacher-text-muted)]">
                          {students} students · {c.lectures} lectures · {c.questions} questions · {c.tests} tests
                          {avg != null ? ` · Avg score ${avg}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" style={{ width: `${(students / maxStudents) * 100}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-teal-600 w-10 text-right">{students}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TeacherGlassPanel>
        </div>
      )}
    </div>
  );
}