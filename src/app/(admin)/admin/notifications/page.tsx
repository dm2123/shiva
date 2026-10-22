import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { mysqlPool } from '@/lib/db';

export const revalidate = 0;

const TYPE_COLORS: Record<string, string> = {
  INFO: 'bg-blue-50 text-blue-700 border-blue-200',
  WARNING: 'bg-amber-50 text-amber-700 border-amber-200',
  SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ERROR: 'bg-red-50 text-red-700 border-red-200',
};

export default async function AdminNotificationsPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const [rows]: any = await mysqlPool.query(
    `SELECT n.id, n.title, n.message, n.type, n.isRead, n.createdAt,
            u.email AS recipientEmail, u.role AS recipientRole
       FROM Notifications n
       JOIN Users u ON n.userId = u.id
      ORDER BY n.createdAt DESC
      LIMIT 200`
  );
  const notifications = rows || [];
  const unread = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Notifications</h1>
        <p className="text-sm text-slate-500 mt-1">{notifications.length} notifications · {unread} unread</p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-sm text-slate-500">
          No notifications have been broadcast yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {notifications.map((n: any) => (
              <div key={n.id} className={`p-5 ${n.isRead ? '' : 'bg-blue-50/40'}`}>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${TYPE_COLORS[n.type] || TYPE_COLORS.INFO}`}>
                    {n.type}
                  </span>
                  {!n.isRead && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase">Unread</span>
                  )}
                  <span className="ml-auto text-xs text-slate-400">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <h2 className="font-bold text-slate-900 text-sm mt-3">{n.title}</h2>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                <p className="text-xs text-slate-400 mt-3">
                  To: <b className="text-slate-600">{n.recipientEmail}</b>
                  <span className="ml-2 uppercase text-[10px] font-bold text-slate-400">({n.recipientRole})</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}