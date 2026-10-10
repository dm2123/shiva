'use client';

import { IconBell, IconUser } from './TeacherIcons';

export default function TeacherHeader({ user }: { user: any }) {
  return (
    <header className="h-16 bg-[var(--teacher-surface)] border-b border-[var(--teacher-border)] flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="text-sm font-semibold text-[var(--teacher-text)]">
        Teacher Management Portal
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-[var(--teacher-primary-light)] text-[var(--teacher-text-muted)]">
          <IconBell size={18} />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
          <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
            {user.email[0].toUpperCase()}
          </span>
          <span className="text-xs font-semibold text-slate-700">{user.email}</span>
        </div>
      </div>
    </header>
  );
}
