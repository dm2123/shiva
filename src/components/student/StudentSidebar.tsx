'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconHome, IconBook, IconBookOpen, IconPlay, IconRadio, IconVideo,
  IconClipboard, IconPencil, IconFileText, IconClock, IconTarget,
  IconHash, IconLayers, IconHelpCircle, IconUsers, IconMessageCircle,
  IconGrid, IconUser, IconAward, IconSettings,
} from './StudentIcons';

/**
 * Student portal ka grouped sidebar nav — SHIVA ke ASAL routes se bana.
 * Har href src/app/(student)/app ke andar asal route hai (koi invent nahi).
 * Desktop sidebar aur mobile drawer (PWStudentMenu) dono yahi list use karte hain.
 */
export const SIDEBAR_GROUPS = [
  {
    title: 'LEARN',
    items: [
      { name: 'Dashboard', href: '/app', icon: IconHome },
      { name: 'My Courses', href: '/app/my-courses', icon: IconBook },
      { name: 'Learn', href: '/app/learn', icon: IconPlay },
      { name: 'Live Classes', href: '/app/live', icon: IconRadio },
      { name: 'Recordings', href: '/app/recordings', icon: IconVideo },
    ],
  },
  {
    title: 'PRACTICE',
    items: [
      { name: 'Tests', href: '/app/tests', icon: IconClipboard },
      { name: 'Practice', href: '/app/practice', icon: IconPencil },
      { name: 'DPP', href: '/app/dpp', icon: IconFileText },
      { name: 'PYQ', href: '/app/pyq', icon: IconClock },
      { name: 'Question Bank', href: '/app/question-bank', icon: IconTarget },
    ],
  },
  {
    title: 'LIBRARY',
    items: [
      { name: 'eBooks', href: '/app/ebooks', icon: IconBookOpen },
      { name: 'Formula Sheets', href: '/app/formula-sheets', icon: IconHash },
      { name: 'NCERT', href: '/app/ncert', icon: IconLayers },
    ],
  },
  {
    title: 'SUPPORT',
    items: [
      { name: 'Doubts', href: '/app/doubts', icon: IconHelpCircle },
      { name: 'Mentors', href: '/app/mentors', icon: IconUsers },
      { name: 'Counsellor', href: '/app/counsellor', icon: IconMessageCircle },
      { name: 'Community', href: '/app/community', icon: IconGrid },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { name: 'Profile', href: '/app/profile', icon: IconUser },
      { name: 'Scholarships', href: '/app/scholarships', icon: IconAward },
      { name: 'Settings', href: '/app/settings', icon: IconSettings },
    ],
  },
] as const;

/** Boundary-aware active check — /app/learn ko /app/leaderboard se alag rakhta hai. */
export function isSidebarItemActive(pathname: string, href: string) {
  if (href === '/app') return pathname === '/app';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudentSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() || '/app';

  return (
    <nav className="px-3 py-4 space-y-5" aria-label="Student navigation">
      {SIDEBAR_GROUPS.map((group) => (
        <div key={group.title}>
          <h3 className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
            {group.title}
          </h3>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isSidebarItemActive(pathname, item.href);
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
                    active
                      ? 'bg-violet-50 text-[#6d28d9] font-semibold'
                      : 'text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <ItemIcon size={18} className={active ? 'text-[#6d28d9]' : 'text-gray-400'} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

/**
 * Desktop grouped sidebar — safed, sticky full-height.
 * Mobile par ye render nahi hota (hidden); wahan PWStudentMenu ka drawer
 * yahi StudentSidebarNav dikhata hai.
 */
export default function StudentSidebar() {
  return (
    <aside
      className="hidden lg:flex lg:flex-col sticky top-0 self-start h-screen w-[264px] shrink-0 bg-white border-r border-gray-200 overflow-y-auto"
      role="navigation"
      aria-label="Student sidebar"
    >
      <StudentSidebarNav />
    </aside>
  );
}
