'use client';

import { useRouter } from 'next/navigation';
import { LiveClass } from '@/types/models';

export default function LiveStudioSelector({ classes = [] }: { classes?: LiveClass[] }) {
  const router = useRouter();

  const liveClasses = classes.filter(c => c.status === 'LIVE');
  const scheduledClasses = classes.filter(c => c.status === 'SCHEDULED');

  return (
    <div className="min-h-screen bg-[#050508] text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2">Live Studio</h1>
          <p className="text-slate-500">Select a live class to enter the broadcasting studio.</p>
        </div>

        {liveClasses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Live Now
            </h2>
            <div className="space-y-3">
              {liveClasses.map(lc => (
                <button key={lc.id} onClick={() => router.push(`/teacher/live-studio?classId=${lc.id}`)}
                  className="w-full flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-all text-left group">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-lg font-bold text-red-500 shrink-0 group-hover:scale-110 transition-transform">▶</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white truncate">{lc.title}</p>
                    <p className="text-xs text-red-400/70">{lc.classType} • Started {new Date(lc.scheduledStartAt).toLocaleTimeString('en-IN')}</p>
                  </div>
                  <span className="text-xs font-bold text-red-400 shrink-0 px-3 py-1 bg-red-500/20 rounded-full uppercase tracking-wider">Join</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {scheduledClasses.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Upcoming
            </h2>
            <div className="space-y-3">
              {scheduledClasses.map(lc => (
                <button key={lc.id} onClick={() => router.push(`/teacher/live-studio?classId=${lc.id}`)}
                  className="w-full flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-all text-left group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-lg font-bold text-emerald-500 shrink-0 group-hover:scale-110 transition-transform">🕐</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white truncate">{lc.title}</p>
                    <p className="text-xs text-emerald-400/70">{lc.classType} • {new Date(lc.scheduledStartAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 shrink-0 px-3 py-1 bg-emerald-500/20 rounded-full uppercase tracking-wider">Prepare</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {classes.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📡</div>
            <p className="text-lg font-bold text-white mb-2">No upcoming classes</p>
            <p className="text-sm text-slate-500 mb-6">Schedule a live class first to use the studio.</p>
            <a href="/teacher/live-classes"
              className="inline-block px-6 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-500 transition-all">
              Go to Live Classes
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
