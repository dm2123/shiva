import { headers } from 'next/headers';
import Link from 'next/link';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import StudentNotificationList from '@/components/student/StudentNotificationList';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { IconBell, IconSettings } from '@/components/student/StudentIcons';

export const revalidate = 0;

export default async function NotificationsPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const [rows]: any = await mysqlPool.query(
    `SELECT id, title, message, type, isRead, createdAt
       FROM Notifications
      WHERE userId = ?
      ORDER BY createdAt DESC
      LIMIT 50`,
    [session.userId]
  );

  const notifications = rows || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-5 pb-24 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="text-[11px] font-bold text-white bg-indigo-600 rounded-full px-2.5 py-1">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Announcements, reminders and alerts from THE SHIVA.</p>
        </div>
        <Link
          href="/app/notifications/preferences"
          className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-full px-4 py-2 hover:shadow-sm transition flex-shrink-0"
        >
          <IconSettings size={14} />
          Preferences
        </Link>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-8">
          <StudentEmptyState
            icon={<IconBell size={24} />}
            title="All Caught Up"
            description="You have no notifications right now. New announcements, test reminders and batch updates will appear here."
            actionText="Explore Courses"
            actionHref="/app/courses"
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-2">
          <StudentNotificationList notifications={notifications} />
        </div>
      )}
    </div>
  );
}
