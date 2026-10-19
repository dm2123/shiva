'use client';

import { usePathname } from 'next/navigation';
import PWStudentHeader from './PWStudentHeader';

const TITLES: Record<string, string> = {
  '/app': 'Home',
  '/app/batches': 'My Batches',
  '/app/courses': 'Courses',
  '/app/my-courses': 'My Courses',
  '/app/learn': 'Classroom',
  '/app/tests': 'Tests',
  '/app/doubts': 'Doubts',
  '/app/ebooks': 'Library',
  '/app/live': 'Live Classes',
  '/app/profile': 'Profile',
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
};

function titleFor(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  // Dynamic routes: /app/courses/[id], /app/learn/[id], /app/tests/[id]
  if (pathname.startsWith('/app/courses/')) return 'Course Details';
  if (pathname.startsWith('/app/learn/')) return 'Classroom';
  if (pathname.startsWith('/app/tests/')) return 'Test';
  if (pathname.startsWith('/app/batches/')) return 'Batch Details';
  return '';
}

export default function StudentHeaderWrapper({
  userName,
  userEmail,
  goal,
}: {
  userName: string;
  userEmail: string;
  goal?: string;
}) {
  const pathname = usePathname();
  const pageTitle = titleFor(pathname || '/app');
  return (
    <PWStudentHeader
      userName={userName}
      userEmail={userEmail}
      goal={goal}
      pageTitle={pageTitle}
    />
  );
}
