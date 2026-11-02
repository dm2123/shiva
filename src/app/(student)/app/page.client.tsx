'use client';

// ============================================================
// THE SHIVA — Student dashboard client shell
// Server page (page.tsx) sirf wahi asal data DB se laata hai
// jo v2 dashboard ke sections ko chahiye (enrollments,
// doubts ginti, recent learning, asal free course) aur
// yahan deta hai; UI PWDashboard component me hai.
// ============================================================

import PWDashboard, { type PWDashboardProps } from '@/components/student/PWDashboard';

export type {
  DashboardEnrollment,
  DashboardDoubtSummary,
  DashboardRecentLearning,
  DashboardPromoCourse,
  PWDashboardProps,
} from '@/components/student/PWDashboard';

export default function DashboardClient(props: PWDashboardProps) {
  return <PWDashboard {...props} />;
}
