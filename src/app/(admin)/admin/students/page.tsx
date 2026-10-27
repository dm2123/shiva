import { mysqlPool } from '@/lib/db';
import { ensureCoreTablesSchema } from '@/lib/ensure-core-tables-schema';
import { ensureStudentProfileSchema } from '@/lib/ensure-student-profile-schema';

export const revalidate = 0;

export const metadata = {
  title: 'Students — THE SHIVA Admin',
};

async function getStudents() {
  // Users JOIN + StudentEnrollments subquery: purane DB par ye tables
  // missing hon to page 1146 deta tha (catch sirf [] chhupa deta tha).
  // Apna leg: FROM StudentProfiles.
  await ensureCoreTablesSchema();
  await ensureStudentProfileSchema();
  try {
    const [rows]: any = await mysqlPool.query(`
      SELECT u.id as userId, u.email, u.status as userStatus, u.createdAt,
             sp.id as profileId, sp.name, sp.phone, sp.targetExam,
             (SELECT COUNT(*) FROM StudentEnrollments se WHERE se.studentId = u.id) as enrollmentCount
      FROM StudentProfiles sp
      JOIN Users u ON u.id = sp.userId
      ORDER BY u.createdAt DESC
    `);
    return rows || [];
  } catch {
    return [];
  }
}

export default async function AdminStudentsPage() {
  const students = await getStudents();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-900">Student Directory</h1>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">All Registered Students</h2>
          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
            {students.length} students
          </span>
        </div>

        {students.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 text-center">No students registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 uppercase text-[10px] font-bold text-slate-500">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Target Exam</th>
                  <th className="p-3">Enrollments</th>
                  <th className="p-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s: any) => (
                  <tr key={s.userId} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{s.name}</td>
                    <td className="p-3 text-slate-500">{s.email}</td>
                    <td className="p-3 font-mono text-slate-500">{s.phone}</td>
                    <td className="p-3">
                      {s.targetExam ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          {s.targetExam}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-slate-900">{s.enrollmentCount}</td>
                    <td className="p-3 text-slate-500">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}