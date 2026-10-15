'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { IconSearch, IconBell, IconUser, IconSettings, IconLogOut, IconChevronRight } from './StudentIcons';

interface StudentHeaderProps {
  user: {
    email?: string;
    role?: string;
  } | null;
}

const pageTitles: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/courses': 'Courses',
  '/app/practice': 'Practice',
  '/app/tests': 'Tests',
  '/app/live': 'Live Classes',
  '/app/batches': 'Batches',
  '/app/doubts': 'Doubts',
  '/app/community': 'Community',
  '/app/notifications': 'Notifications',
  '/app/certificates': 'Certificates',
  '/app/profile': 'Profile',
  '/app/settings': 'Settings',
  '/app/study-plan': 'Study Plan',
  '/app/dpp': 'Daily Practice Problems',
  '/app/pyq': 'Previous Year Questions',
  '/app/bookmarks': 'Bookmarks',
  '/app/assignments': 'Assignments',
  '/app/counsellor': 'Counsellor',
  '/app/offline-centres': 'Offline Centres',
  '/app/recordings': 'Session Recordings',
  '/app/results': 'Results',
};

export default function StudentHeader({ user }: StudentHeaderProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derive page title from pathname
  const title = pageTitles[pathname] || pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard';
  const isSubPage = pathname !== '/app' && pathname.split('/').filter(Boolean).length > 1;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileOpen]);

  return (
    <header
      className="sticky top-0 z-[35] flex items-center justify-between px-4 md:px-6 lg:px-8 border-b transition-colors duration-200"
      style={{
        height: 'var(--header-height)',
        background: 'var(--header-bg)',
        borderColor: 'var(--header-border)',
        backdropFilter: 'blur(16px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.8)',
      }}
      role="banner"
    >
      {/* Left: Breadcrumb + Title */}
      <div className="flex items-center gap-2 min-w-0">
        {isSubPage && (
          <>
            <Link href="/app" className="text-xs font-medium text-[var(--student-text-faint)] hover:text-[var(--student-primary)] transition-colors">
              Dashboard
            </Link>
            <IconChevronRight size={12} className="text-[var(--student-text-faint)] flex-shrink-0" />
          </>
        )}
        <h1 className="text-[15px] font-bold text-[var(--student-text)] truncate tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search capsule (desktop) */}
        <Link
          href="/app/courses"
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-[var(--student-text-muted)] bg-[var(--student-surface)] border border-[var(--student-border)] hover:border-[var(--student-border-strong)] hover:text-[var(--student-text)] transition-all duration-200 shadow-sm"
        >
          <IconSearch size={14} />
          <span>Search</span>
          <kbd className="hidden lg:inline text-[10px] font-mono text-[var(--student-text-faint)] bg-[var(--student-surface-hover)] px-1.5 py-0.5 rounded">
            /
          </kbd>
        </Link>

        {/* Notification bell */}
        <Link
          href="/app/notifications"
          className="relative p-2 rounded-xl text-[var(--student-text-muted)] hover:text-[var(--student-text)] hover:bg-[var(--student-surface-hover)] transition-all duration-200"
          aria-label="Notifications"
        >
          <IconBell size={18} />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--student-danger)] rounded-full border-2 border-[var(--header-bg)]" />
        </Link>

        {/* Profile Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-[var(--student-surface-hover)] transition-all duration-200 border border-transparent hover:border-[var(--student-border)]"
            aria-expanded={profileOpen}
            aria-haspopup="true"
            aria-label="User menu"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.email?.[0]?.toUpperCase() || 'S'}
            </div>
            <span className="hidden sm:block text-xs font-semibold text-[var(--student-text)] max-w-[100px] truncate">
              {user?.email?.split('@')[0] || 'Student'}
            </span>
          </button>

          {/* Dropdown (Floating Glassmorphism) */}
          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden glass-panel-strong z-50 shadow-xl"
              role="menu"
            >
              {/* User info */}
              <div className="px-4 py-3 border-b border-[var(--student-border-light)]">
                <p className="text-sm font-semibold text-[var(--student-text)] truncate">
                  {user?.email?.split('@')[0] || 'Student'}
                </p>
                <p className="text-[11px] text-[var(--student-text-faint)] truncate mt-0.5">
                  {user?.email}
                </p>
                <span className="capsule capsule-primary mt-2">Student</span>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  href="/app/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--student-text-secondary)] hover:bg-[var(--student-surface-hover)] hover:text-[var(--student-primary)] transition-colors"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                >
                  <IconUser size={16} />
                  Profile
                </Link>
                <Link
                  href="/app/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--student-text-secondary)] hover:bg-[var(--student-surface-hover)] hover:text-[var(--student-primary)] transition-colors"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                >
                  <IconSettings size={16} />
                  Settings
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-[var(--student-border-light)] py-1">
                <form action="/api/student/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--student-danger)] hover:bg-[var(--student-danger-light)] transition-colors"
                    role="menuitem"
                  >
                    <IconLogOut size={16} />
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
