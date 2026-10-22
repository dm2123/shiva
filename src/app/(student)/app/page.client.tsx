'use client';

// ============================================================
// THE SHIVA — Student dashboard client shell
// Server page (page.tsx) saara asal data (enrollments +
// progress, aaj ki classes, streak/XP, recommended courses)
// DB se laata hai aur yahan deta hai; asal Study-Home UI
// PWDashboard component me hai (doosri jagah se bhi reuse
// ho sake isliye presentation wahan rakhi hai).
// ============================================================

import PWDashboard, { type PWDashboardProps } from '@/components/student/PWDashboard';

export type {
  DashboardEnrollment,
  DashboardLiveClass,
  DashboardWeekDay,
  DashboardStreak,
  RecommendedCourse,
  PWDashboardProps,
} from '@/components/student/PWDashboard';

export default function DashboardClient(props: PWDashboardProps) {
  return <PWDashboard {...props} />;
}
