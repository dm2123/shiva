'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHome, IconBook, IconPencil, IconBell, IconUser } from './StudentIcons';

const dockItems = [
  { name: 'Home', href: '/app', icon: IconHome },
  { name: 'Courses', href: '/app/courses', icon: IconBook },
  { name: 'Practice', href: '/app/practice', icon: IconPencil },
  { name: 'Alerts', href: '/app/notifications', icon: IconBell },
  { name: 'Profile', href: '/app/profile', icon: IconUser },
];

export default function StudentMobileDock() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/app') return pathname === '/app';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[45] pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {/* Glass dock container */}
      <div
        className="mx-3 mb-3 rounded-2xl flex items-center justify-around px-1 py-1 glass-panel-dark shadow-dock"
      >
        {dockItems.map((item) => {
          const active = isActive(item.href);
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200 min-w-[3.5rem] ${
                active
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-current={active ? 'page' : undefined}
              aria-label={item.name}
            >
              {/* Active background glow */}
              {active && (
                <span className="absolute inset-0 rounded-xl bg-[var(--dock-active)] border border-white/5" />
              )}
              <ItemIcon
                size={20}
                className={`relative z-10 transition-transform duration-200 ${active ? 'scale-110' : ''}`}
              />
              <span className={`relative z-10 text-[9px] font-semibold tracking-wide ${active ? 'text-white' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
