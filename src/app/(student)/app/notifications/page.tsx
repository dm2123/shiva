import { headers } from 'next/headers';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { StudentPageHeader } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import StudentNotificationList from '@/components/student/StudentNotificationList';
import { IconBell } from '@/components/student/StudentIcons';

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

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Notifications"
        description="Stay updated with announcements, reminders, and system alerts."
      />

      {notifications.length === 0 ? (
        <StudentEmptyState
          icon={<IconBell size={24} />}
          title="All Caught Up"
          description="You have no notifications at this time. New announcements and reminders will appear here."
        />
      ) : (
        <StudentNotificationList notifications={notifications} />
      )}
    </div>
  );
}