'use client';

/**
 * THE SHIVA original SVG icon set.
 * Hand-designed for THE SHIVA brand — indigo/violet primary (#4f46e5),
 * amber accent (#f59e0b), dark navy (#1a1a2e).
 * Do NOT copy icons from PW or any other platform.
 */

interface IconProps {
  size?: number;
  className?: string;
}

function base(size: number, className: string | undefined, children: React.ReactNode, viewBox = '0 0 24 24') {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* ---------- Exam categories ---------- */

// SSC — government building with columns (original design)
export function IconSSC({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M3 9.5 12 5l9 4.5" />
    <path d="M5 10v7M9.5 10v7M14.5 10v7M19 10v7" />
    <path d="M3 20h18" />
    <path d="M12 5V3.5" />
    <circle cx="12" cy="3" r="0.6" fill="currentColor" />
  </>);
}

// Railway — train front with shiva-style chevron
export function IconRailway({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <rect x="5" y="3.5" width="14" height="13" rx="3" />
    <path d="M5 10h14" />
    <circle cx="9" cy="13.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="13.5" r="1" fill="currentColor" stroke="none" />
    <path d="M8 20l-1.5 2.5M16 20l1.5 2.5" />
    <path d="M9.5 6.8 12 5.5l2.5 1.3" />
  </>);
}

// Banking — coin stack / bank with rupee
export function IconBanking({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <ellipse cx="12" cy="6" rx="7" ry="2.5" />
    <path d="M5 6v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" />
    <path d="M5 12v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" />
    <path d="M10 8.5c.5-.4 1.2-.6 2-.6.9 0 1.6.3 2 .8M10 11c.5-.4 1.2-.6 2-.6.9 0 1.6.3 2 .8" strokeWidth={1.4} />
  </>);
}

// Defence — shield with star
export function IconDefence({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M12 3l7 2.8v5.4c0 4.4-2.9 7.6-7 9.3-4.1-1.7-7-4.9-7-9.3V5.8L12 3z" />
    <path d="M12 8.2l1.1 2.3 2.5.3-1.8 1.8.4 2.5-2.2-1.2-2.2 1.2.4-2.5-1.8-1.8 2.5-.3L12 8.2z" fill="currentColor" stroke="none" opacity={0.85} />
  </>);
}

// Teaching — open book with graduation cap
export function IconTeaching({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M12 6.5C10 5 7.5 4.5 4 4.5c0 5 1.5 9.5 3 12 2.5-.3 4-.8 5-1.5 1 .7 2.5 1.2 5 1.5 1.5-2.5 3-7 3-12-3.5 0-6 .5-8 2z" />
    <path d="M12 6.5v8.5" />
  </>);
}

/* ---------- Quick actions ---------- */

// Test series — clipboard with check
export function IconTestSeries({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <rect x="6" y="4.5" width="12" height="16" rx="2.5" />
    <path d="M9 4.5V3h6v1.5" />
    <path d="M9.5 12.5l2 2 3.5-4" />
    <path d="M9.5 17h5" strokeWidth={1.4} />
  </>);
}

// Doubts — chat bubble with question mark
export function IconDoubts({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M20 12a8 8 0 0 1-8 8H5l-2 2v-2.5A8 8 0 0 1 20 12z" />
    <path d="M9.6 9.6A2.4 2.4 0 0 1 12 8.2c1.3 0 2.4 1 2.4 2.3 0 1.8-2.2 2-2.4 3.5" />
    <circle cx="12" cy="16.5" r="0.7" fill="currentColor" stroke="none" />
  </>);
}

// Library — stacked books
export function IconLibrary({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15.5H6.7A1.7 1.7 0 0 0 5 20.2V4.5z" />
    <path d="M5 19.5A1.5 1.5 0 0 1 6.5 18H19" />
    <path d="M9 7.5h6M9 11h4" strokeWidth={1.4} />
  </>);
}

// Live classes — broadcast waves
export function IconLive({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    <path d="M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M6 18a9 9 0 0 1 0-12M18 6a9 9 0 0 1 0 12" />
  </>);
}

// My courses — graduation cap
export function IconMyCourses({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M12 4L2.5 9 12 14l9.5-5L12 4z" />
    <path d="M6.5 11.5V16c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-4.5" />
    <path d="M21.5 9v5" />
  </>);
}

// Leaderboard — trophy
export function IconTrophy({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" />
    <path d="M8 5H4.5a3.5 3.5 0 0 0 3.6 3.5M16 5h3.5a3.5 3.5 0 0 1-3.6 3.5" />
    <path d="M12 13v4M8.5 20h7M10 17h4" />
  </>);
}

/* ---------- Batch / course art ---------- */

// Aptitude — abacus-inspired beads
export function IconAptitude({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
    <path d="M4 9.5h16" />
    <circle cx="9" cy="6.5" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="15" cy="6.5" r="1.4" strokeWidth={1.4} />
    <circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.4" strokeWidth={1.4} />
    <path d="M12 10.9v-.4M12 16.9v1.6" strokeWidth={1.4} />
  </>);
}

// Target / mission — concentric target with arrow
export function IconTarget({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" strokeWidth={1.4} />
  </>);
}

// Free badge — open gift / spark
export function IconFree({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeWidth={1.4} />
    <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" strokeWidth={1.4} />
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 10.4v3.2M10.4 12h3.2" strokeWidth={1.4} />
  </>);
}

/* ---------- Navigation ---------- */

export function IconHome({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5.5 9.5V20a1 1 0 0 0 1 1H17a1 1 0 0 0 1-1V9.5" />
    <path d="M10 20v-5h4v5" />
  </>);
}

export function IconSearch({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
    <path d="M8.5 11a2.5 2.5 0 0 1 2.5-2.5" strokeWidth={1.4} />
  </>);
}

export function IconBell({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 15 18 9z" />
    <path d="M10 20a2.2 2.2 0 0 0 4 0" />
    <path d="M12 4.5V3" strokeWidth={1.4} />
  </>);
}

export function IconPlay({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M10 8.8v6.4L15.5 12 10 8.8z" fill="currentColor" stroke="none" />
  </>);
}

export function IconBook({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M12 6.5C10 5 7.5 4.5 4 4.5c0 5 1.5 9.5 3 12 2.5-.3 4-.8 5-1.5 1 .7 2.5 1.2 5 1.5 1.5-2.5 3-7 3-12-3.5 0-6 .5-8 2z" />
    <path d="M12 6.5v8.5" />
  </>);
}

export function IconClock({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </>);
}

export function IconCheck({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 12.2l2.4 2.4 4.6-5" />
  </>);
}

export function IconFlame({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M12 3.5c.8 3.2-.5 5-2 6.5C8.5 11.5 7 13 7 15.5A5 5 0 0 0 12 20.5a5 5 0 0 0 5-5c0-4-3.5-6-3-10.5-1.5 1-2 2-2 3.5" />
    <path d="M12 20.5a3 3 0 0 1-3-3c0-1.5 1-2.5 1.8-3.5.6 1 1.2 1.2 1.2 2.7" strokeWidth={1.4} />
  </>);
}

export function IconUsers({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3.5 19.5c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8" />
    <path d="M15.5 5.8a3.2 3.2 0 0 1 0 5.6M17.5 14.9c1.7.7 2.8 2.2 3.1 4.6" strokeWidth={1.4} />
  </>);
}

/* ---------- Profile & account ---------- */

// Single user — profile
export function IconUser({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <circle cx="12" cy="8" r="3.8" />
    <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    <path d="M12 4.2a3.8 3.8 0 0 1 3.8 3.8" strokeWidth={1.4} opacity={0.6} />
  </>);
}

// Settings — gear with shiva-style hub
export function IconSettings({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6" strokeWidth={1.4} />
    <path d="M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8" strokeWidth={1.4} />
  </>);
}

// Wallet — card pocket with clasp
export function IconWallet({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h12A2.5 2.5 0 0 1 20 7.5V9" />
    <rect x="3" y="7" width="18" height="13" rx="2.5" />
    <path d="M15 13.5h5.5" strokeWidth={1.4} />
    <circle cx="17.2" cy="13.5" r="1" fill="currentColor" stroke="none" />
  </>);
}

// Logout — door with outward arrow
export function IconLogout({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M13.5 4H18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4.5" />
    <path d="M3.5 12H14" />
    <path d="M10.5 8.5 14 12l-3.5 3.5" />
  </>);
}

/* ---------- Learning ---------- */

// Batches — stacked layered cards
export function IconBatches({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M12 3.5 20.5 8 12 12.5 3.5 8 12 3.5z" />
    <path d="M4.8 12.3 12 16.2l7.2-3.9" />
    <path d="M4.8 16 12 19.9 19.2 16" strokeWidth={1.4} />
  </>);
}

// Calculator — formula practice
export function IconCalculator({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <rect x="6" y="3" width="12" height="18" rx="2.5" />
    <rect x="9" y="6" width="6" height="2.8" rx="1" strokeWidth={1.4} />
    <circle cx="9.5" cy="12.5" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12.5" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="12.5" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="9.5" cy="15.8" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="12" cy="15.8" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="15.8" r="0.9" strokeWidth={1.4} />
  </>);
}

// Assignment — document with pencil
export function IconAssignment({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M6 3.5h7.5L18.5 8.5V20a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
    <path d="M13.5 3.5v5h5" strokeWidth={1.4} />
    <path d="M9 14.5l4.2-4.2 1.8 1.8-4.2 4.2H9v-1.8z" strokeWidth={1.4} />
  </>);
}

// Award — medal with star (certificates)
export function IconAward({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M9.2 10.2 7.5 3.5h3.6L12 6.4l.9-2.9h3.6l-1.7 6.7" />
    <circle cx="12" cy="14.5" r="4.8" />
    <path d="M12 12.3l.8 1.6 1.8.3-1.3 1.3.3 1.8-1.6-.9-1.6.9.3-1.8-1.3-1.3 1.8-.3.8-1.6z" fill="currentColor" stroke="none" />
  </>);
}

// Video — recordings camera
export function IconVideo({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <rect x="2.5" y="7" width="12.5" height="10.5" rx="2.5" />
    <path d="M15 10.8l6-3.3v9l-6-3.3" />
    <circle cx="8.7" cy="12.2" r="1.8" strokeWidth={1.4} />
  </>);
}

// Analytics — bar chart
export function IconChart({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M4 20.5h16" strokeWidth={1.4} />
    <rect x="6" y="12.5" width="3.2" height="8" rx="1" />
    <rect x="10.9" y="8.5" width="3.2" height="12" rx="1" />
    <rect x="15.8" y="4.5" width="3.2" height="16" rx="1" />
  </>);
}

// Bookmark — save for later
export function IconBookmark({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-4.2L6 21V4.5a1 1 0 0 1 1-1z" />
    <path d="M9.5 8h5" strokeWidth={1.4} />
  </>);
}

/* ---------- Utility ---------- */

export function IconDownload({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M12 3.5V15" />
    <path d="M7.5 10.8 12 15.3l4.5-4.5" />
    <path d="M4.5 19.5h15" />
  </>);
}

export function IconShare({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="17.5" cy="5.5" r="2.5" />
    <circle cx="17.5" cy="18.5" r="2.5" />
    <path d="M8.3 10.7l6.9-4M8.3 13.3l6.9 4" strokeWidth={1.4} />
  </>);
}

export function IconStar({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M12 3.5l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.9l6.1-.8L12 3.5z" />
  </>);
}

export function IconLock({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    <circle cx="12" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
  </>);
}

export function IconMenu({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h10" />
  </>);
}

export function IconX({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </>);
}

export function IconCalendar({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 9.7h17" />
    <path d="M8 2.8v3.4M16 2.8v3.4" />
    <circle cx="12" cy="14.5" r="1" fill="currentColor" stroke="none" />
  </>);
}

export function IconFilter({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M4 5.5h16l-6.2 7.1v5.2l-3.6 2v-7.2L4 5.5z" />
  </>);
}

/* ---------- Chevrons ---------- */

export function IconChevronLeft({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M14.5 6 8.5 12l6 6" />
  </>);
}

export function IconChevronRight({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M9.5 6l6 6-6 6" />
  </>);
}

export function IconChevronUp({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M6 14.5 12 8.5l6 6" />
  </>);
}

export function IconChevronDown({ size = 24, className }: IconProps) {
  return base(size, className, <>
    <path d="M6 9.5l6 6 6-6" />
  </>);
}
