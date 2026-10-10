'use client';

import { useState, useEffect, useCallback } from 'react';
import { safeFetch } from '@/lib/api-client';
import { TeacherPageHeader, TeacherGlassPanel } from '@/components/teacher/TeacherShared';

export default function TeacherDoubtsPage() {
  const [doubts, setDoubts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDoubts = useCallback(async () => {
    setLoading(true);
    const res = await safeFetch('/api/teacher/doubts');
    if (res.success) setDoubts(res.data.doubts || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

  const resolveDoubt = async (id: string) => {
    if (!responseText.trim()) {
      setStatusMsg({ type: 'error', text: 'Please write a response before resolving.' });
      return;
    }
    setRespondingId(id);
    setStatusMsg(null);
    const res = await safeFetch('/api/teacher/doubts', {
      method: 'PATCH',
      body: JSON.stringify({ id, response: responseText.trim() }),
    });
    setRespondingId(null);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Doubt resolved and sent to the student.' });
      setResponseText('');
      fetchDoubts();
    } else {
      setStatusMsg({ type: 'error', text: res.error?.message || 'Failed to resolve doubt.' });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 relative">
      <div className="relative z-10">
        <TeacherPageHeader
          title="Doubt Resolution"
          description="Interact directly with students and resolve their academic queries."
        />
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-xl text-xs border ${
            statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[var(--teacher-text-muted)]">Loading doubts...</p>
      ) : doubts.length === 0 ? (
        <TeacherGlassPanel>
          <div className="text-center py-12 text-[var(--teacher-text-muted)]">
            <p className="text-4xl mb-3 opacity-40">📥</p>
            <p className="font-semibold text-[var(--teacher-text)]">Inbox Zero</p>
            <p className="text-sm mt-1">You currently have no pending doubts from your students.</p>
          </div>
        </TeacherGlassPanel>
      ) : (
        <div className="space-y-4">
          {doubts.map((d) => (
            <TeacherGlassPanel key={d.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-[var(--teacher-text)]">{d.title}</h3>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        d.status === 'OPEN'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--teacher-text-muted)] mt-1">
                    Asked by {d.studentName || 'Anonymous'} on {d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                  </p>
                </div>
              </div>

              <p className="text-sm text-[var(--teacher-text)] leading-relaxed">{d.description}</p>

              {d.status === 'OPEN' ? (
                <div className="pt-2 border-t border-[var(--teacher-border)] space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Write your answer for the student..."
                    value={respondingId === d.id ? responseText : ''}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none text-[var(--teacher-text)]"
                  />
                  <button
                    onClick={() => resolveDoubt(d.id)}
                    disabled={respondingId === d.id}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                  >
                    {respondingId === d.id ? 'Resolving...' : 'Resolve Doubt'}
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-[var(--teacher-border)] bg-emerald-50 dark:bg-emerald-500/10 rounded-lg p-3">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">Your Response</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{d.teacherResponse}</p>
                </div>
              )}
            </TeacherGlassPanel>
          ))}
        </div>
      )}
    </div>
  );
}