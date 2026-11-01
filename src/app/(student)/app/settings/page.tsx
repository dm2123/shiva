'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import {
  IconMoon,
  IconSun,
  IconUser,
  IconCheck,
  IconBell,
  IconShield,
  IconHelpCircle,
  IconChevronRight,
  IconSettings,
} from '@/components/student/StudentIcons';
import StudentChangePassword from '@/components/student/StudentChangePassword';

const themes = [
  {
    id: 'light' as const,
    name: 'Light',
    description: 'Clean bright interface',
    icon: IconSun,
    preview: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e0e7ff 100%)',
  },
  {
    id: 'dark' as const,
    name: 'Dark',
    description: 'Elegant dark mode',
    icon: IconMoon,
    preview: 'linear-gradient(135deg, #0b0f1a 0%, #1e293b 50%, #334155 100%)',
  },
  {
    id: 'aurora' as const,
    name: 'Aurora',
    description: 'Purple, Pink, Blue, Cyan',
    icon: IconMoon,
    preview: 'linear-gradient(135deg, #a855f7 0%, #ec4899 33%, #3b82f6 66%, #06b6d4 100%)',
  },
  {
    id: 'sunset' as const,
    name: 'Sunset',
    description: 'Orange, Red, Pink, Yellow',
    icon: IconMoon,
    preview: 'linear-gradient(135deg, #f97316 0%, #ef4444 33%, #ec4899 66%, #fbbf24 100%)',
  },
  {
    id: 'ocean' as const,
    name: 'Ocean',
    description: 'Blue, Cyan, Teal, Green',
    icon: IconMoon,
    preview: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 33%, #14b8a6 66%, #10b981 100%)',
  },
  {
    id: 'forest' as const,
    name: 'Forest',
    description: 'Green, Emerald, Lime, Teal',
    icon: IconMoon,
    preview: 'linear-gradient(135deg, #10b981 0%, #14b8a6 33%, #84cc16 66%, #06b6d4 100%)',
  },
  {
    id: 'royal' as const,
    name: 'Royal',
    description: 'Purple, Violet, Indigo, Blue',
    icon: IconMoon,
    preview: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 33%, #6366f1 66%, #818cf8 100%)',
  },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-[#f5b942] to-[#6d28d9]" aria-hidden="true" />
      <h2 className="text-lg font-bold text-[var(--student-text)] tracking-tight">{children}</h2>
    </div>
  );
}

export default function SettingsPage() {
  const { theme: currentTheme, setTheme } = useTheme();

  return (
    <div className="space-y-6 pb-24">
      {/* ── Page header ── */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6d28d9] to-[#2a1650] text-white flex items-center justify-center shadow-lg shadow-[#6d28d9]/25 flex-shrink-0">
          <IconSettings size={22} />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-[var(--student-text)] tracking-tight">Settings</h1>
          <p className="text-sm text-[var(--student-text-muted)] mt-0.5">Manage your appearance, security and preferences.</p>
        </div>
      </div>

      {/* ── Appearance (asal ThemeContext wiring — har theme sach me apply hota hai) ── */}
      <section>
        <SectionTitle>Appearance</SectionTitle>
        <div className="student-card p-5">
          <p className="text-sm font-semibold text-[var(--student-text)] mb-1">Theme</p>
          <p className="text-xs text-[var(--student-text-muted)] mb-4">Pick the look you like — it applies across the app.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {themes.map((theme) => {
              const ThemeIcon = theme.icon;
              const isActive = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  aria-pressed={isActive}
                  className={`relative p-3 rounded-2xl border-2 transition text-left ${
                    isActive
                      ? 'border-[#6d28d9] shadow-lg shadow-[#6d28d9]/20 bg-[#6d28d9]/5'
                      : 'border-[var(--student-border)] hover:border-[#6d28d9]/50'
                  }`}
                >
                  {isActive && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#f5b942] flex items-center justify-center shadow z-10">
                      <IconCheck size={13} className="text-[#2a1650]" strokeWidth={3} />
                    </div>
                  )}
                  <div
                    className="w-full h-20 rounded-xl mb-2.5 flex items-center justify-center ring-1 ring-black/5"
                    style={{ background: theme.preview }}
                  >
                    <ThemeIcon size={22} className="text-white/80" />
                  </div>
                  <p className="text-[13px] font-bold text-[var(--student-text)]">{theme.name}</p>
                  <p className="text-[10px] text-[var(--student-text-muted)]">{theme.description}</p>
                  {isActive && (
                    <p className="text-[10px] font-bold text-[#6d28d9] mt-1 uppercase tracking-wide">Active</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Account & Security (password change = asal API wiring) ── */}
      <section>
        <SectionTitle>Account &amp; Security</SectionTitle>
        <div className="student-card divide-y divide-[var(--student-border-light)]">
          <div className="p-5">
            <StudentChangePassword />
          </div>
          <Link href="/app/profile" className="p-4 flex items-center gap-3 hover:bg-[var(--student-surface-hover)] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#6d28d9]/10 text-[#6d28d9] flex items-center justify-center flex-shrink-0">
              <IconUser size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--student-text)]">Profile Information</p>
              <p className="text-xs text-[var(--student-text-muted)]">Name, contact and target exam</p>
            </div>
            <IconChevronRight size={16} className="text-[var(--student-text-faint)] flex-shrink-0" />
          </Link>
        </div>
      </section>

      {/* ── Notifications (sirf asal pages ke links — koi dead toggle nahi) ── */}
      <section>
        <SectionTitle>Notifications</SectionTitle>
        <div className="student-card divide-y divide-[var(--student-border-light)]">
          <Link href="/app/notifications" className="p-4 flex items-center gap-3 hover:bg-[var(--student-surface-hover)] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#f5b942]/15 text-[#92600a] dark:text-[#f5b942] flex items-center justify-center flex-shrink-0">
              <IconBell size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--student-text)]">View Notifications</p>
              <p className="text-xs text-[var(--student-text-muted)]">Announcements, reminders and alerts</p>
            </div>
            <IconChevronRight size={16} className="text-[var(--student-text-faint)] flex-shrink-0" />
          </Link>
          <Link href="/app/notifications/preferences" className="p-4 flex items-center gap-3 hover:bg-[var(--student-surface-hover)] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#6d28d9]/10 text-[#6d28d9] flex items-center justify-center flex-shrink-0">
              <IconShield size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--student-text)]">Notification Preferences</p>
              <p className="text-xs text-[var(--student-text-muted)]">Choose what you want to hear about</p>
            </div>
            <IconChevronRight size={16} className="text-[var(--student-text-faint)] flex-shrink-0" />
          </Link>
        </div>
      </section>

      {/* ── Help ── */}
      <section>
        <SectionTitle>Help &amp; Support</SectionTitle>
        <div className="student-card">
          <Link href="/app/counsellor" className="p-4 flex items-center gap-3 hover:bg-[var(--student-surface-hover)] transition-colors rounded-[1.25rem]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <IconHelpCircle size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--student-text)]">Talk to a Counsellor</p>
              <p className="text-xs text-[var(--student-text-muted)]">Account help, course guidance and more</p>
            </div>
            <IconChevronRight size={16} className="text-[var(--student-text-faint)] flex-shrink-0" />
          </Link>
        </div>
      </section>
    </div>
  );
}
