'use client';

interface Props {
  present: number;
  total: number;
}

export default function AttendanceTracker({ present, total }: Props) {
  const percent = total > 0 ? Math.round((present / total) * 100) : 0;
  const isGood = percent >= 75;

  return (
    <div className="rounded-xl border border-[var(--student-border)] bg-[var(--student-surface)] p-4 flex items-center gap-4">
      <div className={`w-3 h-3 rounded-full shrink-0 ${isGood ? 'bg-emerald-500' : 'bg-red-500'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[var(--student-text)] text-sm font-bold">
          Attendance
          <span className="ml-2 text-xs font-medium text-[var(--student-text-muted)]">
            {present}/{total} classes
          </span>
        </p>
        <div
          className="w-full bg-[var(--student-surface-hover)] rounded-full h-2 mt-1.5 overflow-hidden"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Attendance"
        >
          <div
            className={`h-2 rounded-full ${isGood ? 'bg-emerald-500' : 'bg-red-500'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        {total === 0 && (
          <p className="text-[11px] text-[var(--student-text-faint)] mt-1.5">Abhi koi class record nahi hai.</p>
        )}
      </div>
      <span className={`text-lg font-black ${isGood ? 'text-emerald-500' : 'text-red-500'}`}>
        {percent}%
      </span>
    </div>
  );
}
