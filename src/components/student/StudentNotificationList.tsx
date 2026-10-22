'use client';

import { useEffect, useState } from 'react';
import { IconBell, IconHelpCircle, IconCheckCircle, IconX } from '@/components/student/StudentIcons';

export interface StudentNotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  isRead: boolean;
  createdAt: string;
}

interface StudentNotificationListProps {
  notifications: StudentNotificationItem[];
}

export default function StudentNotificationList({ notifications }: StudentNotificationListProps) {
  const [items, setItems] = useState(notifications);
  const [markingAll, setMarkingAll] = useState(false);

  // Drawer/page dobara khulne par nayi list aaye to state sync rakho
  useEffect(() => {
    setItems(notifications);
  }, [notifications]);

  const iconFor = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <IconCheckCircle size={16} className="text-emerald-600" />;
      case 'WARNING': return <IconHelpCircle size={16} className="text-amber-600" />;
      case 'ERROR': return <IconX size={16} className="text-red-600" />;
      default: return <IconBell size={16} className="text-[var(--student-primary)]" />;
    }
  };

  const colorFor = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'bg-emerald-50 border-emerald-100';
      case 'WARNING': return 'bg-amber-50 border-amber-100';
      case 'ERROR': return 'bg-red-50 border-red-100';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  const markRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await fetch('/api/student/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
    } catch {
      /* non-fatal */
    }
  };

  // Asal API (PATCH /api/student/notifications, ids[]) se saare unread ek saath read
  const markAllRead = async () => {
    const unreadIds = items.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length === 0 || markingAll) return;
    setMarkingAll(true);
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch('/api/student/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: unreadIds }),
      });
    } catch {
      /* non-fatal — agli baar fetch par asal state dikhega */
    } finally {
      setMarkingAll(false);
    }
  };

  const unread = items.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-4">
      {unread > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold text-[var(--student-primary)] uppercase tracking-widest">
            {unread} unread {unread === 1 ? 'notification' : 'notifications'}
          </p>
          <button
            type="button"
            onClick={markAllRead}
            disabled={markingAll}
            className="text-[11px] font-bold text-[#6d28d9] hover:text-[#2a1650] uppercase tracking-widest disabled:opacity-50 transition-colors"
          >
            {markingAll ? 'Marking…' : 'Mark All Read'}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => !n.isRead && markRead(n.id)}
            className={`w-full text-left student-card p-5 transition-colors ${
              n.isRead ? 'opacity-60' : 'hover:border-[var(--student-primary)]'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${colorFor(n.type)}`}>
                {iconFor(n.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[var(--student-text)]">{n.title}</p>
                  <span className="text-2xs text-[var(--student-text-faint)] text-[10px] whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-xs text-[var(--student-text-muted)] leading-relaxed mt-1">{n.message}</p>
              </div>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-[var(--student-primary)] flex-shrink-0 mt-1" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
