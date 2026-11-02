'use client';

import { useCallback, useEffect, useState, type ComponentType } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PWStudentMenu from './PWStudentMenu';
import StudentNotificationList, {
  type StudentNotificationItem,
} from './StudentNotificationList';
import { IconSearch, IconBell, IconFlame, IconStar } from './ShivaIcons';
import { IconArrowLeft } from './StudentIcons';

interface PWStudentHeaderProps {
  userName: string;
  userEmail: string;
  goal?: string;
  /** Dashboard par true — dashboard par sub-header patti hi nahi aati
   *  (PW par Study page seedha content se shuru hota hai). Inner pages
   *  par sub-header = `← Back` + streak/XP pills (PW pattern). */
  hideTitleBar?: boolean;
  /** DailyStreaks se asal current streak; load na ho to null (pill nahi dikhega) */
  streak?: number | null;
  /** StudentXP se asal total XP; load na ho to null (pill nahi dikhega) */
  totalXP?: number | null;
  /** Notifications table se asal unread ginti; badge sirf > 0 par */
  unreadCount?: number;
}

type IconComponent = ComponentType<{ size?: number; className?: string }>;

/** Sub-header ki stat pill — PW pattern: outline pill, icon gray circle
 *  me, bold number. Sirf asal streak/XP par render hoti hai. */
function StatPill({
  Icon,
  iconColor,
  value,
  label,
}: {
  Icon: IconComponent;
  iconColor: string;
  value: string;
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-3 shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
      aria-label={label}
    >
      <span className={`flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 ${iconColor}`}>
        <Icon size={14} />
      </span>
      <span className="text-[14px] font-extrabold tabular-nums text-gray-900">{value}</span>
    </span>
  );
}

export default function PWStudentHeader({
  userName,
  userEmail,
  goal,
  hideTitleBar = false,
  streak = null,
  totalXP = null,
  unreadCount = 0,
}: PWStudentHeaderProps) {
  const router = useRouter();

  // Sub-header ka Back — asal browser history par back; history na ho
  // (seedha link se aaya ho) to dashboard fallback.
  const goBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/app');
    }
  }, [router]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // ── Notification drawer state ──────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState<StudentNotificationItem[] | null>(null);
  const [notifError, setNotifError] = useState(false);
  const [unread, setUnread] = useState(unreadCount);

  // Layout se nayi unread ginti aaye (route change par) to badge sync rakho
  useEffect(() => {
    setUnread(unreadCount);
  }, [unreadCount]);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/student/notifications');
      const json = await res.json();
      const list: StudentNotificationItem[] = json?.data?.notifications || [];
      setNotifItems(list);
      setUnread(list.filter((n) => !n.isRead).length);
      setNotifError(false);
    } catch {
      setNotifError(true);
    }
  }, []);

  const openNotifications = () => {
    setNotifOpen(true);
    setNotifItems(null);
    setNotifError(false);
    loadNotifications();
  };

  const closeNotifications = () => {
    setNotifOpen(false);
    // Drawer ke andar read hue honge — badge asal state se dobara sync karo
    loadNotifications();
  };

  // Drawer khule par Escape + scroll lock
  useEffect(() => {
    if (!notifOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeNotifications();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifOpen]);

  const initial = (userName || userEmail || 'S').charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-50 shadow-[0_1px_8px_rgba(16,24,40,0.14)]">
        {/* ── Upar patti (KAALA strip, PW shell #121216) ─────── */}
        <div className="bg-[#121216] text-white">
          <div className="flex items-center gap-2 sm:gap-3 px-4 lg:px-6 py-2.5">
            {/* Hamburger — sirf mobile/tablet; desktop par sidebar dikhta hai */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="lg:hidden min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center hover:bg-white/10 rounded-lg transition shrink-0"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Logo + naam — desktop par sidebar ke brand block me
                dikhta hai (ek hi dark band), yahan sirf mobile/tablet */}
            <Link href="/app" className="flex items-center gap-2.5 shrink-0 lg:hidden" aria-label="THE SHIVA — Home">
              <Image
                src="/assets/logo.jpeg"
                alt="THE SHIVA"
                width={36}
                height={36}
                className="rounded-lg shadow-sm"
              />
              <span className="hidden min-[420px]:block leading-tight">
                <span className="block font-extrabold tracking-wide text-[15px]">THE SHIVA</span>
                <span className="block text-[10px] text-white/55 font-medium">Student Portal</span>
              </span>
            </Link>

            {/* Goal pill — asal StudentProfiles.targetExam ka plain label
                (PW ka cohort pill pattern; ye switcher NAHI hai, sirf
                student ka asal target exam dikhata hai). Goal na ho to
                set karne ka link. */}
            {goal ? (
              <span
                className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 text-sm font-medium shrink-0 ml-1"
                aria-label={`Target exam: ${goal}`}
              >
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs">
                  🎯
                </span>
                <span className="max-w-[110px] sm:max-w-[140px] truncate">{goal}</span>
              </span>
            ) : (
              <Link
                href="/app/goals"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-full px-3 py-1.5 text-sm font-medium transition shrink-0 ml-1"
              >
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs">
                  🎯
                </span>
                <span className="max-w-[110px] sm:max-w-[140px] truncate">Goal set karo</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="hidden sm:block">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            )}

            <div className="flex-1" />

            {/* PW pattern: top bar me streak/XP chips NAHI hote —
                ve dashboard ke header row aur inner pages ke
                sub-header me dikhte hain. Yahan sirf search, bell,
                avatar (PW shell). */}

            {/* Search — har page par top bar se hi uplabdh */}
            <Link
              href="/app/search"
              aria-label="Search"
              className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full transition hover:bg-white/10"
            >
              <IconSearch size={20} />
            </Link>

            {/* Ghanti — notification drawer kholta hai; badge asal unread par hi */}
            <button
              onClick={openNotifications}
              aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
              className="relative min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 rounded-full transition shrink-0"
            >
              <IconBell size={20} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#121216]">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </button>

            {/* Avatar + naam → 3-item menu (Profile | Purchases | Logout) */}
            <div className="relative shrink-0">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 hover:bg-white/10 rounded-full pl-1 pr-1 md:pr-2.5 min-h-[44px] transition"
                aria-label="Profile menu"
                aria-expanded={profileOpen}
              >
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-[#6d28d9] flex items-center justify-center font-bold text-sm shrink-0">
                  {initial}
                </span>
                <span className="hidden md:block max-w-[120px] truncate text-sm font-semibold text-left">
                  {userName}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="hidden md:block">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 bg-white text-gray-800 rounded-2xl shadow-2xl w-60 overflow-hidden">
                    <div className="px-4 py-3 bg-violet-50/60 border-b border-gray-100">
                      <p className="text-sm font-bold truncate">{userName}</p>
                      <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                    </div>
                    <Link
                      href="/app/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      <span className="text-sm font-medium">My Profile</span>
                    </Link>
                    <Link
                      href="/app/payments"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                      <span className="text-sm font-medium">My Purchases</span>
                    </Link>
                    <div className="border-t border-gray-100" />
                    <form action="/api/public/auth/logout" method="POST">
                      <button type="submit" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition w-full text-left">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg>
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Sub-header (inner pages) — PW pattern: safed patti,
            baayen sirf `← Back` (title is patti me NAHI — har page
            ka title uske content ke andar bada h1 hai), daayen asal
            streak + XP pills. Dashboard par ye patti nahi aati. ── */}
        {!hideTitleBar && (
          <div className="border-b border-gray-200 bg-white text-gray-900">
            <div className="flex items-center gap-3 px-4 py-2.5 lg:px-6">
              <button
                onClick={goBack}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg px-2 -ml-2 text-[15px] font-bold text-gray-900 transition hover:bg-gray-50"
                aria-label="Pichhle page par wapas jao"
              >
                <IconArrowLeft size={20} />
                Back
              </button>
              <div className="ml-auto flex items-center gap-2.5">
                {streak !== null && (
                  <StatPill
                    Icon={IconFlame}
                    iconColor="text-orange-500"
                    value={String(streak)}
                    label={`${streak} din ki streak`}
                  />
                )}
                {totalXP !== null && (
                  <StatPill
                    Icon={IconStar}
                    iconColor="text-[#d97706]"
                    value={Number(totalXP).toLocaleString('en-IN')}
                    label={`${totalXP} XP`}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile grouped sidebar drawer */}
      <PWStudentMenu open={menuOpen} onClose={() => setMenuOpen(false)} userName={userName} />

      {/* ── Notification drawer (daaye se) ───────────────────── */}
      {notifOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[70]"
            onClick={closeNotifications}
            aria-hidden="true"
          />
          <aside
            className="fixed right-0 top-0 bottom-0 w-[380px] max-w-[92vw] bg-white z-[71] shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Notifications"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
              <span className="text-[#6d28d9]">
                <IconBell size={20} />
              </span>
              <h2 className="text-[15px] font-bold text-gray-900 flex-1">Notifications</h2>
              <button
                onClick={closeNotifications}
                aria-label="Close notifications"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {notifItems === null && !notifError && (
                <p className="text-sm text-gray-400 text-center py-10">Loading notifications…</p>
              )}

              {notifError && (
                <div className="text-center py-10 px-4">
                  <p className="text-sm font-semibold text-gray-700">Notifications load nahi ho paye</p>
                  <p className="text-xs text-gray-400 mt-1">Connection check karke dobara koshish karo.</p>
                  <button
                    onClick={loadNotifications}
                    className="mt-4 text-sm font-semibold text-white bg-[#6d28d9] hover:bg-[#2a1650] rounded-full px-5 py-2 transition"
                  >
                    Retry
                  </button>
                </div>
              )}

              {notifItems !== null && !notifError && notifItems.length === 0 && (
                <div className="text-center py-12 px-4">
                  <span className="mx-auto w-14 h-14 rounded-full bg-violet-50 text-[#6d28d9] flex items-center justify-center">
                    <IconBell size={24} />
                  </span>
                  <p className="text-sm font-bold text-gray-800 mt-4">All caught up!</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Abhi koi notification nahi hai. Naye announcements, test reminders aur batch updates yahin dikhenge.
                  </p>
                </div>
              )}

              {notifItems !== null && !notifError && notifItems.length > 0 && (
                <StudentNotificationList notifications={notifItems} />
              )}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 shrink-0">
              <Link
                href="/app/notifications"
                onClick={closeNotifications}
                className="block text-center text-sm font-semibold text-[#6d28d9] hover:text-[#2a1650] py-1.5 transition"
              >
                View all notifications →
              </Link>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
