'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { StudentPageHeader, StudentSection } from '@/components/student/StudentShared';
import { IconMoon, IconSun, IconUser, IconCheck, IconBell } from '@/components/student/StudentIcons';
import StudentChangePassword from '@/components/student/StudentChangePassword';

const themes = [
  {
    id: 'light' as const,
    name: 'Light',
    description: 'Clean bright interface',
    icon: IconSun,
    preview: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e0e7ff 100%)',
    textColor: '#0f172a',
  },
  {
    id: 'dark' as const,
    name: 'Dark',
    description: 'Elegant dark mode',
    icon: IconMoon,
    preview: 'linear-gradient(135deg, #0b0f1a 0%, #1e293b 50%, #334155 100%)',
    textColor: '#f1f5f9',
  },
  {
    id: 'aurora' as const,
    name: 'Aurora',
    description: 'Purple, Pink, Blue, Cyan',
    icon: IconMoon,
    preview: 'linear-gradient(135deg, #a855f7 0%, #ec4899 33%, #3b82f6 66%, #06b6d4 100%)',
    textColor: '#faf5ff',
  },
  {
    id: 'sunset' as const,
    name: 'Sunset',
    description: 'Orange, Red, Pink, Yellow',
    icon: IconMoon,
    preview: 'linear-gradient(135deg, #f97316 0%, #ef4444 33%, #ec4899 66%, #fbbf24 100%)',
    textColor: '#fff7ed',
  },
  {
    id: 'ocean' as const,
    name: 'Ocean',
    description: 'Blue, Cyan, Teal, Green',
    icon: IconMoon,
    preview: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 33%, #14b8a6 66%, #10b981 100%)',
    textColor: '#f0f9ff',
  },
  {
    id: 'forest' as const,
    name: 'Forest',
    description: 'Green, Emerald, Lime, Teal',
    icon: IconMoon,
    preview: 'linear-gradient(135deg, #10b981 0%, #14b8a6 33%, #84cc16 66%, #06b6d4 100%)',
    textColor: '#f0fdf4',
  },
  {
    id: 'royal' as const,
    name: 'Royal',
    description: 'Purple, Violet, Indigo, Blue',
    icon: IconMoon,
    preview: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 33%, #6366f1 66%, #818cf8 100%)',
    textColor: '#faf5ff',
  },
];

export default function SettingsPage() {
  const { theme: currentTheme, setTheme } = useTheme();

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <StudentPageHeader
        title="Settings"
        description="Manage your preferences, security, and account settings."
      />

      {/* Appearance - Theme Selector */}
      <StudentSection title="Appearance">
        <div className="student-card p-6 space-y-6">
          <div>
            <p className="text-sm font-semibold text-[var(--student-text)] mb-1">Theme Preference</p>
            <p className="text-xs text-[var(--student-text-muted)] leading-relaxed">
              Choose your favorite multi-color gradient theme. Each theme combines 4 beautiful colors for a unique experience.
            </p>
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {themes.map((theme) => {
              const ThemeIcon = theme.icon;
              const isActive = currentTheme === theme.id;

              return (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl ${
                    isActive
                      ? 'border-[var(--student-primary)] shadow-xl shadow-[var(--student-primary)]/20'
                      : 'border-[var(--student-border)] hover:border-[var(--student-border-strong)]'
                  }`}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[var(--student-primary)] flex items-center justify-center shadow-lg animate-scale-in z-10">
                      <IconCheck size={14} className="text-white" strokeWidth={3} />
                    </div>
                  )}

                  {/* Theme Preview - Multi-color Gradient */}
                  <div
                    className="w-full h-24 rounded-xl mb-3 shadow-md relative overflow-hidden ring-1 ring-black/5"
                    style={{ background: theme.preview }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 backdrop-blur-[1px]">
                      <ThemeIcon size={28} />
                    </div>
                  </div>

                  {/* Theme Info */}
                  <div className="text-left">
                    <p className="text-sm font-bold text-[var(--student-text)] mb-1">{theme.name}</p>
                    <p className="text-[10px] text-[var(--student-text-muted)] leading-tight">{theme.description}</p>
                  </div>

                  {/* Hover Ring Effect */}
                  <div className={`absolute inset-0 rounded-2xl ring-2 ring-transparent transition-all duration-300 pointer-events-none ${
                    isActive ? 'ring-[var(--student-primary)]' : 'group-hover:ring-[var(--student-primary)]/30'
                  }`} />
                </button>
              );
            })}
          </div>
        </div>
      </StudentSection>

      {/* Account & Security */}
      <StudentSection title="Account & Security">
        <div className="student-card divide-y divide-[var(--student-border-light)]">
          <div className="p-5">
            <StudentChangePassword />
          </div>

          <div className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-lg bg-[var(--student-info-light)] flex items-center justify-center text-[var(--student-info)] flex-shrink-0">
                <IconUser size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--student-text)] mb-0.5">Profile Information</p>
                <p className="text-xs text-[var(--student-text-muted)]">View your name, contact and target exam details</p>
              </div>
            </div>
            <a
              href="/app/profile"
              className="text-xs font-semibold px-4 py-2 bg-[var(--student-surface-hover)] text-[var(--student-text-secondary)] rounded-full hover:opacity-80 transition"
            >
              View
            </a>
          </div>
        </div>
      </StudentSection>

      {/* Notifications */}
      <StudentSection title="Notifications">
        <div className="student-card p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-lg bg-[var(--student-warning-light)] flex items-center justify-center text-[var(--student-warning)] flex-shrink-0">
                <IconBell size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--student-text)] mb-0.5">Push Notifications</p>
                <p className="text-xs text-[var(--student-text-muted)]">Receive alerts for assignments, tests, and announcements</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-not-allowed">
              <input type="checkbox" disabled className="sr-only peer" />
              <div className="w-11 h-6 bg-[var(--student-border)] rounded-full peer peer-checked:bg-[var(--student-primary)] transition-colors"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-[var(--student-border-light)]">
            <p className="text-xs text-[var(--student-text-faint)] italic">
              Notification preferences will be available in a future update.
            </p>
          </div>
        </div>
      </StudentSection>

      {/* Danger Zone */}
      <StudentSection title="Danger Zone">
        <div className="student-card p-6 border-[var(--student-danger)] border-dashed">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--student-danger)] mb-1">Delete Account</p>
              <p className="text-xs text-[var(--student-text-muted)] leading-relaxed">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <button
              disabled
              className="text-xs font-semibold px-4 py-2 bg-[var(--student-danger-light)] text-[var(--student-danger)] rounded-full cursor-not-allowed opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      </StudentSection>
    </div>
  );
}
