'use client';

import { usePathname } from 'next/navigation';
import PWStudentHeader from './PWStudentHeader';

/**
 * Shell header ka wrapper — PW pattern ke hisaab se:
 * - Dashboard (/app) par sub-header patti nahi (hideTitleBar) — page ka
 *   apna 'Study' header row hi ekmatra header hai.
 * - Inner pages par sub-header me sirf `← Back` + asal streak/XP pills
 *   aate hain; page ka title is patti me NAHI hota (har page ke content
 *   ke andar apna bada h1 pehle se hai), isliye yahan koi title map
 *   nahi rakha gaya hai.
 * - streak/totalXP layout se aate hain aur header hote hue sub-header
 *   ki pills ko milte hain (top bar me chips nahi hote — PW shell).
 */
export default function StudentHeaderWrapper({
  userName,
  userEmail,
  goal,
  streak,
  totalXP,
  unreadCount,
}: {
  userName: string;
  userEmail: string;
  goal?: string;
  streak?: number | null;
  totalXP?: number | null;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  return (
    <PWStudentHeader
      userName={userName}
      userEmail={userEmail}
      goal={goal}
      hideTitleBar={(pathname || '/app') === '/app'}
      streak={streak}
      totalXP={totalXP}
      unreadCount={unreadCount}
    />
  );
}
