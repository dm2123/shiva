'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  IconHome, IconBook, IconBookOpen, IconPlay, IconRadio, IconVideo,
  IconClipboard, IconPencil, IconFileText, IconClock, IconTarget,
  IconHash, IconLayers, IconHelpCircle, IconUsers, IconMessageCircle,
  IconGrid, IconUser, IconAward, IconSettings, IconZap, IconList,
} from './StudentIcons';
import { IconBookmark, IconWallet } from './ShivaIcons';

/**
 * Student portal ka grouped sidebar nav — PW shell ke group order/grammar
 * (LEARN ONLINE / STUDY PACKS / OFFLINE / EXPLORE / MORE) par, par saare
 * items SHIVA ke ASAL routes se (koi invent nahi; PW ke apne products —
 * Pi, Power Batch, PW Store waghera — yahan NAHI hain kyunki SHIVA me
 * woh features hain hi nahi).
 * Desktop sidebar aur mobile drawer (PWStudentMenu) dono yahi list use karte hain.
 */
export const SIDEBAR_GROUPS = [
  {
    title: 'LEARN ONLINE',
    items: [
      { name: 'Study', href: '/app', icon: IconPencil },
      { name: 'My Courses', href: '/app/my-courses', icon: IconPlay },
      { name: 'Library', href: '/app/library', icon: IconBookOpen },
      { name: 'Live Classes', href: '/app/live', icon: IconRadio },
      { name: 'Recordings', href: '/app/recordings', icon: IconVideo },
    ],
  },
  {
    title: 'STUDY PACKS',
    items: [
      { name: 'Batches', href: '/app/batches', icon: IconLayers },
      { name: 'Test Series', href: '/app/tests', icon: IconClipboard },
      { name: 'Practice', href: '/app/practice', icon: IconZap },
      { name: 'DPP', href: '/app/dpp', icon: IconFileText },
      { name: 'PYQ', href: '/app/pyq', icon: IconClock },
      { name: 'Question Bank', href: '/app/question-bank', icon: IconTarget },
      { name: 'Scholarship', href: '/app/scholarships', icon: IconAward },
    ],
  },
  {
    title: 'OFFLINE',
    items: [
      { name: 'Offline Centres', href: '/app/offline-centres', icon: IconHome },
    ],
  },
  {
    title: 'EXPLORE',
    items: [
      { name: 'eBooks', href: '/app/ebooks', icon: IconBook },
      { name: 'Formula Sheets', href: '/app/formula-sheets', icon: IconHash },
      { name: 'NCERT', href: '/app/ncert', icon: IconList },
      { name: 'Bookmarks', href: '/app/bookmarks', icon: IconBookmark },
      { name: 'Community', href: '/app/community', icon: IconGrid },
    ],
  },
  {
    title: 'MORE',
    items: [
      { name: 'Doubts', href: '/app/doubts', icon: IconHelpCircle },
      { name: 'Mentors', href: '/app/mentors', icon: IconUsers },
      { name: 'Counsellor', href: '/app/counsellor', icon: IconMessageCircle },
      { name: 'Profile', href: '/app/profile', icon: IconUser },
      { name: 'My Purchases', href: '/app/payments', icon: IconWallet },
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
    <nav className="py-5 space-y-8" aria-label="Student navigation">
      {SIDEBAR_GROUPS.map((group) => (
        <div key={group.title}>
          <h3 className="px-6 mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
            {group.title}
          </h3>
          <div>
            {group.items.map((item) => {
              const active = isSidebarItemActive(pathname, item.href);
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={`mx-3 flex items-center gap-3.5 rounded-full px-4 py-3 text-[15px] transition-colors ${
                    active
                      ? 'bg-[#121216] font-bold text-white shadow-sm'
                      : 'font-medium text-[#333333] hover:bg-gray-50'
                  }`}
                >
                  <ItemIcon size={20} className={active ? 'text-white' : 'text-gray-500'} />
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
      {/* Brand block — top bar (h-16, kaala #121216) ki seedh me,
          taaki upar ek hi continuous kaala band lage (PW shell) */}
      <Link
        href="/app"
        className="flex h-16 shrink-0 items-center gap-2.5 bg-[#121216] px-5 text-white"
        aria-label="THE SHIVA — Home"
      >
        <Image
          src="/assets/logo.jpeg"
          alt="THE SHIVA"
          width={36}
          height={36}
          className="rounded-lg shadow-sm"
        />
        <span className="leading-tight">
          <span className="block text-[15px] font-extrabold tracking-wide">THE SHIVA</span>
          <span className="block text-[10px] font-medium text-white/55">Student Portal</span>
        </span>
      </Link>
      <StudentSidebarNav />
    </aside>
  );
}
