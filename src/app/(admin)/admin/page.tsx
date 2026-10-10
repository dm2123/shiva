import { getPlatformStats, mysqlPool } from '@/lib/db';

export const revalidate = 0;

async function getOperationalMetrics() {
  try {
    const [enrollCount]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM StudentEnrollments WHERE status = "ACTIVE"');
    const [orderRows]: any = await mysqlPool.query('SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as revenue FROM Orders WHERE status = "SUCCESS"');
    const [liveCount]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM LiveClasses WHERE status = "SCHEDULED"');
    const [batchCount]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM Batches WHERE status IN ("UPCOMING", "ACTIVE")');
    const [pendingTeacherCount]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM TeacherProfiles WHERE status = "pending_setup"');
    const [recentOrders]: any = await mysqlPool.query(`
      SELECT o.id, o.amount, o.status, o.paymentMethod, o.createdAt,
             sp.name as studentName, c.title as courseTitle
      FROM Orders o
      LEFT JOIN StudentProfiles sp ON o.studentId = sp.userId
      LEFT JOIN Courses c ON o.courseId = c.id
      ORDER BY o.createdAt DESC LIMIT 5
    `);
    return {
      enrollments: enrollCount[0]?.count || 0,
      orders: orderRows[0]?.count || 0,
      revenue: Number(orderRows[0]?.revenue || 0),
      liveClasses: liveCount[0]?.count || 0,
      batches: batchCount[0]?.count || 0,
      pendingTeachers: pendingTeacherCount[0]?.count || 0,
      recentOrders: recentOrders || [],
    };
  } catch {
    return { enrollments: 0, orders: 0, revenue: 0, liveClasses: 0, batches: 0, pendingTeachers: 0, recentOrders: [] };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getPlatformStats();
  const ops = await getOperationalMetrics();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white p-8 rounded-2xl shadow-md border border-slate-800">
        <h1 className="text-3xl font-extrabold mb-2">Admin Control Center</h1>
        <p className="text-red-200 text-sm">
          Platform governance and operational metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Students</span>
          <span className="text-3xl font-extrabold text-slate-900">{stats.students}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Teachers</span>
          <span className="text-3xl font-extrabold text-slate-900">{stats.teachers}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Courses</span>
          <span className="text-3xl font-extrabold text-emerald-600">{stats.courses}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Educator Partners</span>
          <span className="text-3xl font-extrabold text-indigo-600">{stats.educators}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Enrollments</span>
          <span className="text-3xl font-extrabold text-blue-600">{ops.enrollments}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Revenue (Paid Orders)</span>
          <span className="text-3xl font-extrabold text-emerald-600">₹{ops.revenue.toLocaleString('en-IN')}</span>
          <span className="block text-xs text-slate-500 mt-1">{ops.orders} successful orders</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Scheduled Live Classes</span>
          <span className="text-3xl font-extrabold text-violet-600">{ops.liveClasses}</span>
          <span className="block text-xs text-slate-500 mt-1">{ops.batches} active/upcoming batches</span>
        </div>
      </div>

      {ops.pendingTeachers > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          {ops.pendingTeachers} teacher profile(s) awaiting setup approval.
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4">Recent Orders</h2>
        {ops.recentOrders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders placed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-200">
                  <th className="pb-2 pr-3 font-semibold">Student</th>
                  <th className="pb-2 pr-3 font-semibold">Course</th>
                  <th className="pb-2 pr-3 font-semibold">Amount</th>
                  <th className="pb-2 pr-3 font-semibold">Method</th>
                  <th className="pb-2 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {ops.recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-3 text-slate-800">{order.studentName || order.studentId}</td>
                    <td className="py-2 pr-3 text-slate-600">{order.courseTitle || '—'}</td>
                    <td className="py-2 pr-3 font-semibold text-slate-900">₹{Number(order.amount).toLocaleString('en-IN')}</td>
                    <td className="py-2 pr-3 text-slate-500">{order.paymentMethod || '—'}</td>
                    <td className="py-2 text-slate-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
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