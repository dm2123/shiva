import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { mysqlPool } from '@/lib/db';

export const revalidate = 0;

export default async function AdminCertificatesPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const [rows]: any = await mysqlPool.query(
    `SELECT sp.name AS studentName, st.email AS studentEmail, c.title AS courseTitle, e.enrolledAt,
            (SELECT COUNT(*) FROM Lectures l JOIN Chapters ch ON l.chapterId = ch.id JOIN Subjects s ON ch.subjectId = s.id WHERE s.courseId = c.id) AS totalLectures,
            (SELECT COUNT(*) FROM LectureProgress lp JOIN Lectures l ON lp.lectureId = l.id JOIN Chapters ch ON l.chapterId = ch.id JOIN Subjects s ON ch.subjectId = s.id WHERE s.courseId = c.id AND lp.studentId = e.studentId AND lp.isCompleted = 1) AS completedLectures
       FROM StudentEnrollments e
       JOIN Courses c ON e.courseId = c.id
       JOIN StudentProfiles sp ON e.studentId = sp.userId
       JOIN Users st ON e.studentId = st.id
      WHERE e.status = 'ACTIVE'
      ORDER BY sp.name, c.title`
  );
  const enrollments = rows || [];

  const eligible = enrollments.filter(
    (e: any) => Number(e.totalLectures) > 0 && Number(e.completedLectures) >= Number(e.totalLectures)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Course Completion Certificates</h1>
        <p className="text-sm text-slate-500 mt-1">
          {enrollments.length} active enrollments · {eligible.length} eligible for certification
        </p>
      </div>

      {eligible.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-sm text-slate-500">
          Curriculum completion is verified from completed lecture progress. No completions qualify yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eligible.map((e: any, i: number) => (
            <div key={`${e.studentEmail}-${e.courseTitle}`} className="bg-white rounded-xl border-2 border-amber-200 shadow-sm p-6 text-center">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow">
                {i + 1}
              </div>
              <h2 className="font-black text-slate-900 text-lg mt-4">Certificate of Completion</h2>
              <p className="text-sm text-slate-600 mt-2">
                Awarded to <b className="text-slate-900">{e.studentName}</b> ({e.studentEmail})
              </p>
              <p className="text-sm text-slate-600 mt-1">
                for successfully completing all {e.totalLectures} lectures of
                <b className="text-slate-900"> {e.courseTitle}</b>
              </p>
              <p className="text-xs text-slate-400 mt-3">
                Enrolled {new Date(e.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}