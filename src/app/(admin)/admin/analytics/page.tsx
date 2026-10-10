import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { mysqlPool } from '@/lib/db';

export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const [students]: any = await mysqlPool.query('SELECT COUNT(*) AS c FROM StudentProfiles');
  const [teachers]: any = await mysqlPool.query('SELECT COUNT(*) AS c FROM TeacherProfiles WHERE status = "active"');
  const [pendingTeachers]: any = await mysqlPool.query('SELECT COUNT(*) AS c FROM TeacherProfiles WHERE status = "pending_setup"');
  const [courses]: any = await mysqlPool.query('SELECT COUNT(*) AS c FROM Courses WHERE isPublished = 1');
  const [enrollments]: any = await mysqlPool.query('SELECT COUNT(*) AS c FROM StudentEnrollments WHERE status = "ACTIVE"');
  const [revenue]: any = await mysqlPool.query('SELECT COUNT(*) AS orders, COALESCE(SUM(amount), 0) AS total FROM Orders WHERE status = "SUCCESS"');
  const [tests]: any = await mysqlPool.query('SELECT COUNT(*) AS c FROM Tests WHERE status = "PUBLISHED"');
  const [attempts]: any = await mysqlPool.query('SELECT COUNT(*) AS c FROM AssessmentAttempts WHERE status = "EVALUATED"');
  const [assessments]: any = await mysqlPool.query('SELECT type, COUNT(*) AS c FROM Assessments GROUP BY type');
  const [doubts]: any = await mysqlPool.query('SELECT status, COUNT(*) AS c FROM Doubts GROUP BY status');
  const [live]: any = await mysqlPool.query('SELECT status, COUNT(*) AS c FROM LiveClasses GROUP BY status');
  const [completedProgress]: any = await mysqlPool.query('SELECT COUNT(DISTINCT studentId) AS c FROM LectureProgress WHERE isCompleted = 1');
  const [monthlyRevenue]: any = await mysqlPool.query(
    `SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month, COUNT(*) AS orders, COALESCE(SUM(amount), 0) AS total
       FROM Orders WHERE status = 'SUCCESS' GROUP BY DATE_FORMAT(createdAt, '%Y-%m') ORDER BY month DESC LIMIT 6`
  );
  const [auditCount]: any = await mysqlPool.query('SELECT COUNT(*) AS c FROM AuditLogs');

  const cards = [
    { label: 'Registered Students', value: students[0]?.c || 0, accent: 'text-blue-600' },
    { label: 'Active Teachers', value: teachers[0]?.c || 0, accent: 'text-indigo-600' },
    { label: 'Pending Teacher Setups', value: pendingTeachers[0]?.c || 0, accent: 'text-amber-600' },
    { label: 'Published Courses', value: courses[0]?.c || 0, accent: 'text-emerald-600' },
    { label: 'Active Enrollments', value: enrollments[0]?.c || 0, accent: 'text-teal-600' },
    { label: 'Successful Orders', value: revenue[0]?.orders || 0, accent: 'text-violet-600' },
    { label: 'Gross Revenue', prefix: '₹', value: Number(revenue[0]?.total || 0).toLocaleString('en-IN'), accent: 'text-slate-900' },
    { label: 'Audit Log Entries', value: auditCount[0]?.c || 0, accent: 'text-slate-500' },
    { label: 'Published Tests', value: tests[0]?.c || 0, accent: 'text-rose-600' },
    { label: 'Evaluated Attempts', value: attempts[0]?.c || 0, accent: 'text-cyan-600' },
    { label: 'Students Actively Learning', value: completedProgress[0]?.c || 0, accent: 'text-lime-600' },
    { label: 'Total Live Classes Scheduled', value: (live.find((r: any) => r.status === 'SCHEDULED')?.c || 0), accent: 'text-pink-600' },
  ];

  const assessmentTotals = (assessments || []).map((r: any) => `${r.type}: ${r.c}`).join(' · ') || '—';
  const doubtTotals = (doubts || []).map((r: any) => `${r.status}: ${r.c}`).join(' · ') || '—';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white p-8 rounded-2xl shadow-md border border-slate-800">
        <h1 className="text-3xl font-extrabold mb-2">Platform Intelligence</h1>
        <p className="text-red-200 text-sm">Growth metrics, financial intelligence, and content health across the platform.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((k) => (
          <div key={k.label} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className={`text-2xl font-extrabold block ${k.accent}`}>{k.prefix || ''}{k.value}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">{k.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Assessment Vitals</h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assessment mix</p>
            <p className="text-sm text-slate-800 mt-2">{assessmentTotals}</p>
            <div className="mt-4 h-px bg-slate-100" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-4">Doubts by state</p>
            <p className="text-sm text-slate-800 mt-2">{doubtTotals}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Live Class Pipeline</h2>
          </div>
          <div className="px-6 py-5 space-y-2">
            {(live || []).length === 0 ? (
              <p className="text-sm text-slate-500">No live classes scheduled yet.</p>
            ) : (
              (live || []).map((r: any) => (
                <div key={r.status} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{r.status}</span>
                  <span className="text-sm font-extrabold text-slate-900">{r.c}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Monthly Revenue Trend</h2>
        </div>
        <div className="px-6 py-5 overflow-x-auto">
          {(monthlyRevenue || []).length === 0 ? (
            <p className="text-sm text-slate-500">No successful orders yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-200">
                  <th className="pb-2 pr-3 font-semibold">Month</th>
                  <th className="pb-2 pr-3 font-semibold">Orders</th>
                  <th className="pb-2 font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(monthlyRevenue || []).map((r: any) => (
                  <tr key={r.month} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-3 text-slate-800">{r.month}</td>
                    <td className="py-2 pr-3 text-slate-600">{r.orders}</td>
                    <td className="py-2 font-bold text-emerald-600">₹{Number(r.total).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}