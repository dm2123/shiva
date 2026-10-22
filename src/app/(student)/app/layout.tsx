import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { mysqlPool } from '@/lib/db';
import StudentHeaderWrapper from '@/components/student/StudentHeaderWrapper';
import StudentSidebar from '@/components/student/StudentSidebar';

export const metadata = {
  title: 'Student Portal — THE SHIVA',
  description: 'Your learning workspace on THE SHIVA platform',
};

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const session = await getSessionFromHeaders(headers());

  if (!session || session.role !== 'STUDENT') {
    redirect('/login');
  }

  const userName = (session as any).name || session.email.split('@')[0];

  // Goal chip ke liye asal goal (StudentProfiles.targetExam).
  // Na mile to undefined — header "goal set karo" dikhayega, koi bana hua default nahi.
  let goal: string | undefined;
  try {
    const [rows]: any = await mysqlPool.query(
      'SELECT targetExam FROM StudentProfiles WHERE userId = ? LIMIT 1',
      [(session as any).userId]
    );
    goal = rows?.[0]?.targetExam || undefined;
  } catch {
    goal = undefined;
  }

  // Header chips ke liye asal streak (DailyStreaks) aur XP (StudentXP) —
  // dashboard (page.tsx) wali hi ginati; load na ho to null, chip nahi dikhega.
  const userId = (session as any).userId;
  let streak: number | null = null;
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT streakDate FROM DailyStreaks
        WHERE studentId = ? AND streakDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ORDER BY streakDate DESC`,
      [userId]
    );
    const dateSet = new Set<string>(
      (rows || []).map((s: any) => new Date(s.streakDate).toISOString().split('T')[0])
    );
    let current = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const check = new Date(today);
      check.setDate(check.getDate() - i);
      if (dateSet.has(check.toISOString().split('T')[0])) current++;
      else if (i > 0) break;
    }
    streak = current;
  } catch {
    streak = null;
  }

  let totalXP: number | null = null;
  try {
    const [rows]: any = await mysqlPool.query(
      'SELECT COALESCE(SUM(points), 0) AS total FROM StudentXP WHERE studentId = ?',
      [userId]
    );
    totalXP = Number(rows?.[0]?.total) || 0;
  } catch {
    totalXP = null;
  }

  // Ghanti badge ke liye asal unread ginti — 0 ho to badge nahi dikhega.
  let unreadCount = 0;
  try {
    const [rows]: any = await mysqlPool.query(
      'SELECT COUNT(*) AS n FROM Notifications WHERE userId = ? AND isRead = 0',
      [userId]
    );
    unreadCount = Number(rows?.[0]?.n) || 0;
  } catch {
    unreadCount = 0;
  }

  // Consistent THE SHIVA shell on every student page:
  // upar patti (header) + baaya grouped sidebar (desktop) + content
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 lg:flex">
        <StudentSidebar />
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          <StudentHeaderWrapper
            userName={userName}
            userEmail={session.email}
            goal={goal}
            streak={streak}
            totalXP={totalXP}
            unreadCount={unreadCount}
          />
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}
