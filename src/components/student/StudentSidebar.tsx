'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import {
  IconHome, IconBook, IconPencil, IconClipboard, IconTrendingUp,
  IconRadio, IconUsers, IconHelpCircle, IconMessageCircle,
  IconBell, IconAward, IconUser, IconSettings, IconTarget, IconPieChart,
  IconX, IconRefresh, IconBookOpen, IconZap, IconCalendar, IconGrid,
  IconMic, IconFileText, IconStar, IconUpload, IconVideo
} from './StudentIcons';

const navGroups = [
  {
    title: 'LEARNING',
    items: [
      { name: 'Home', href: '/app', icon: IconHome },
      { name: 'My Courses', href: '/app/courses', icon: IconBook },
      { name: 'Live Classes', href: '/app/live', icon: IconRadio },
      { name: 'Recordings', href: '/app/recordings', icon: IconVideo },
    ],
  },
  {
    title: 'PRACTICE & TESTS',
    items: [
      { name: 'Practice', href: '/app/practice', icon: IconPencil },
      { name: 'DPP', href: '/app/dpp', icon: IconClipboard },
      { name: 'PYQ', href: '/app/pyq', icon: IconFileText },
      { name: 'Question Bank', href: '/app/question-bank', icon: IconTarget },
      { name: 'Video Solutions', href: '/app/video-solutions', icon: IconVideo },
      { name: 'Assignments', href: '/app/assignments', icon: IconBookOpen },
      { name: 'Tests', href: '/app/tests', icon: IconTarget },
    ],
  },
  {
    title: 'PLANNING & ANALYSIS',
    items: [
      { name: 'Study Plan', href: '/app/study-plan', icon: IconCalendar },
      { name: 'Results', href: '/app/results', icon: IconPieChart },
      { name: 'Streak', href: '/app/streak', icon: IconAward },
      { name: 'Leaderboard', href: '/app/leaderboard', icon: IconAward },
      { name: 'Bookmarks', href: '/app/bookmarks', icon: IconStar },
    ],
  },
  {
    title: 'TOOLS & SUPPORT',
    items: [
      { name: 'e-Books', href: '/app/ebooks', icon: IconBook },
      { name: 'Formula Sheets', href: '/app/formula-sheets', icon: IconFileText },
      { name: 'Offline Downloads', href: '/app/offline-downloads', icon: IconVideo },
      { name: 'Announcements', href: '/app/announcements', icon: IconBell },
      { name: 'Doubts', href: '/app/doubts', icon: IconHelpCircle },
      { name: 'Counsellor', href: '/app/counsellor', icon: IconMessageCircle },
      { name: 'Offline Centres', href: '/app/offline-centres', icon: IconGrid },
      { name: 'Community', href: '/app/community', icon: IconMessageCircle },
      { name: 'Notifications', href: '/app/notifications/preferences', icon: IconBell },
      { name: 'Certificates', href: '/app/certificates', icon: IconAward },
    ],
  },
];

const bottomItems = [
  { name: 'Profile', href: '/app/profile', icon: IconUser },
  { name: 'Settings', href: '/app/settings', icon: IconSettings },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.fromTo(
      sidebar,
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
    );
  }, []);

  const isActive = (href: string) => {
    if (href === '/app') return pathname === '/app';
    return pathname.startsWith(href);
  };

  return (
    <aside
      ref={sidebarRef}
      className="hidden lg:flex flex-col fixed top-0 left-0 z-40 h-screen bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]"
      style={{ width: 'var(--sidebar-width)' }}
      role="navigation"
      aria-label="Student sidebar navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-[var(--header-height)] border-b border-[var(--student-border-light)] flex-shrink-0">
        <Image
          src="/assets/logo.jpeg"
          alt="THE SHIVA"
          width={28}
          height={28}
          className="rounded-lg shadow-sm"
        />
        <span className="font-extrabold text-[13px] tracking-tight text-[var(--student-text)]">
          THE SHIVA
        </span>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-4">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h3 className="px-3 text-[10px] font-bold text-[var(--student-text-faint)] uppercase tracking-wider mb-1.5">
              {group.title}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                      active
                        ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-semibold'
                        : 'text-[var(--student-text-muted)] hover:text-[var(--student-text)] hover:bg-[var(--student-surface-hover)]'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--student-primary)]" />
                    )}
                    <ItemIcon size={18} className={active ? 'text-[var(--sidebar-active-text)]' : 'text-[var(--student-text-faint)] group-hover:text-[var(--student-text-muted)]'} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-3 border-t border-[var(--student-border-light)] space-y-0.5 flex-shrink-0">
        {bottomItems.map((item) => {
          const active = isActive(item.href);
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                active
                  ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-semibold'
                  : 'text-[var(--student-text-muted)] hover:text-[var(--student-text)] hover:bg-[var(--student-surface-hover)]'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <ItemIcon size={18} className={active ? 'text-[var(--sidebar-active-text)]' : 'text-[var(--student-text-faint)] group-hover:text-[var(--student-text-muted)]'} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
