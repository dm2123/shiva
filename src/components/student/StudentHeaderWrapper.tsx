'use client';

import { usePathname } from 'next/navigation';
import PWStudentHeader from './PWStudentHeader';

const TITLES: Record<string, string> = {
  '/app': 'Study',
  '/app/batches': 'My Batches',
  '/app/courses': 'Courses',
  '/app/my-courses': 'My Courses',
  '/app/learn': 'Classroom',
  '/app/tests': 'Tests',
  '/app/doubts': 'Doubts',
  '/app/ebooks': 'Library',
  '/app/live': 'Live Classes',
  '/app/profile': 'Profile',
  '/app/payments': 'My Purchases',
  '/app/goals': 'My Goal',
  '/app/search': 'Search',
  '/app/notifications': 'Notifications',
  '/app/settings': 'Settings',
  '/app/analytics': 'Analytics',
  '/app/leaderboard': 'Leaderboard',
  '/app/assignments': 'Assignments',
  '/app/practice': 'Practice',
  '/app/pyq': 'PYQs',
  '/app/dpp': 'DPP',
  '/app/study-plan': 'Study Plan',
  '/app/bookmarks': 'Bookmarks',
  '/app/certificates': 'Certificates',
  '/app/recordings': 'Recordings',
  '/app/announcements': 'Announcements',
  '/app/streak': 'Daily Streak',
  '/app/question-bank': 'Question Bank',
  '/app/subscriptions': 'My Subscription',
  '/app/community': 'Community',
  '/app/mentors': 'Mentors',
  '/app/counsellor': 'Counsellor',
  '/app/scholarships': 'Scholarships',
  '/app/formula-sheets': 'Formula Sheets',
  '/app/ncert': 'NCERT',
  '/app/faculty': 'Teachers',
  '/app/video-solutions': 'Video Solutions',
  '/app/offline-downloads': 'Downloads',
  '/app/results': 'My Results',
};

function titleFor(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  // Dynamic routes: /app/courses/[id], /app/learn/[id], /app/tests/[id]
  if (pathname.startsWith('/app/courses/')) return 'Course Details';
  if (pathname.startsWith('/app/learn/')) return 'Classroom';
  if (pathname.startsWith('/app/tests/')) return 'Test';
  if (pathname.startsWith('/app/batches/')) return 'Batch Details';
  if (pathname.startsWith('/app/live/')) return 'Live Class';
  if (pathname.startsWith('/app/ncert/')) return 'NCERT';
  if (pathname.startsWith('/app/scholarships/')) return 'Scholarship Details';
  return '';
}

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
  const pageTitle = titleFor(pathname || '/app');
  return (
    <PWStudentHeader
      userName={userName}
      userEmail={userEmail}
      goal={goal}
      pageTitle={pageTitle}
      streak={streak}
      totalXP={totalXP}
      unreadCount={unreadCount}
    />
  );
}
