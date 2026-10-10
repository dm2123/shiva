'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { TeacherGlassPanel } from '@/components/teacher/TeacherShared';
import { IconCheck } from '@/components/teacher/TeacherIcons';

export default function TeacherThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-3xl">
      <TeacherGlassPanel>
        <h3 className="text-lg font-bold text-[var(--teacher-text)] mb-4">Workspace Root Theme</h3>
        <p className="text-sm text-[var(--teacher-text-muted)] mb-6">Select a global color footprint for your workspace. Note: The core Teacher Identity restricts primary actions to the Emerald/Teal family for consistency, but backgrounds and surfaces will follow the global theme.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['light', 'dark', 'aurora', 'sunset', 'ocean', 'forest', 'royal'].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t as any)}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                theme === t 
                  ? 'border-teal-500 bg-teal-500/10' 
                  : 'border-[var(--teacher-border)] hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {theme === t && (
                <div className="absolute top-2 right-2 text-teal-500">
                  <IconCheck size={16} />
                </div>
              )}
              <div className="font-bold text-[var(--teacher-text)] capitalize mb-1">{t}</div>
            </button>
          ))}
        </div>
      </TeacherGlassPanel>
    </div>
  );
}
