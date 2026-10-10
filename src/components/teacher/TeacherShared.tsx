// ============================================================
// THE SHIVA — Teacher Shared UI Components
// ============================================================

import React from 'react';

// 1. TeacherPageHeader
export function TeacherPageHeader({ title, description, action }: { title: string, description: string, action?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--teacher-text)] tracking-tight">{title}</h1>
        <p className="text-sm text-[var(--teacher-text-muted)] mt-1">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// 2. TeacherGlassPanel
export function TeacherGlassPanel({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-[var(--teacher-surface)] border border-[var(--teacher-border)] rounded-2xl p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// 3. TeacherStatusCapsule
export function TeacherStatusCapsule({ status }: { status: 'Published' | 'Draft' | 'Live' | 'Archived' }) {
  const styles = {
    Published: 'bg-[var(--teacher-primary-light)] text-[var(--teacher-primary)]',
    Draft: 'bg-slate-100 text-slate-600',
    Live: 'bg-red-50 text-[var(--teacher-live)]',
    Archived: 'bg-slate-50 text-slate-500',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}
