'use client';

import { useState, useEffect, useCallback } from 'react';
import { TeacherPageHeader, TeacherGlassPanel } from '@/components/teacher/TeacherShared';
import TeacherEmptyState from '@/components/teacher/TeacherEmptyState';
import { IconLayers, IconPlus, IconCheck } from '@/components/teacher/TeacherIcons';

export default function TeacherChaptersClient({ initialAssignments = [] }: { initialAssignments?: any[] }) {
  const [isBuilding, setIsBuilding] = useState(false);
  const [courseId, setCourseId] = useState(initialAssignments[0]?.courseId || '');
  const [courseTitle, setCourseTitle] = useState(initialAssignments[0]?.courseTitle || '');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);
  const [chapters, setChapters] = useState<any[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadSubjects = useCallback(async (cid: string) => {
    setSubjects([]);
    setSubjectId('');
    setChapters([]);
    if (!cid) return;
    try {
      const res = await fetch(`/api/teacher/subjects?courseId=${cid}`);
      const data = await res.json();
      if (data.success) setSubjects(data.data.subjects || []);
    } catch { /* ignore */ }
  }, []);

  const loadChapters = useCallback(async (sid: string) => {
    setChapters([]);
    if (!sid) return;
    try {
      const res = await fetch(`/api/teacher/chapters?subjectId=${sid}`);
      const data = await res.json();
      if (data.success) setChapters(data.data.chapters || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (courseId) loadSubjects(courseId);
  }, [courseId, loadSubjects]);

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!subjectId || !chapterTitle.trim()) {
      setErrorMsg('Select a subject and enter a chapter title.');
      return;
    }
    setStatus('Creating...');

    try {
      const res = await fetch('/api/teacher/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          title: chapterTitle.trim(),
          orderIndex: Number(orderIndex) || 1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChapters(prev => [...prev, data.data.chapter]);
        setStatus('Chapter Created!');
        setTimeout(() => {
          setIsBuilding(false);
          setStatus(null);
          setChapterTitle('');
        }, 1000);
      } else {
        setStatus(null);
        setErrorMsg(data.error?.message || 'Error creating chapter');
      }
    } catch {
      setStatus(null);
      setErrorMsg('Network error');
    }
  };

  return (
    <div className="relative">
      <TeacherPageHeader
        title="Chapter Modules"
        description="Organize your curriculum subjects into ordered learning chapters."
      />

      <div className="mt-6">
        {isBuilding ? (
          <TeacherGlassPanel className="max-w-2xl mx-auto p-6 space-y-6">
            <h3 className="text-xl font-bold text-[var(--teacher-text)]">Create New Chapter</h3>

            {errorMsg && (
              <div className="p-3 rounded-xl text-xs font-medium bg-red-50 text-red-800 border border-red-200">{errorMsg}</div>
            )}

            <form onSubmit={handleCreateChapter} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Assigned Course</label>
                <select
                  value={courseId}
                  onChange={(e) => {
                    setCourseId(e.target.value);
                    const c = initialAssignments.find((a: any) => a.courseId === e.target.value);
                    setCourseTitle(c?.courseTitle || '');
                    loadSubjects(e.target.value);
                  }}
                  className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  required
                >
                  <option value="" disabled>Select Course</option>
                  {initialAssignments.map((a: any) => (
                    <option key={a.courseId} value={a.courseId}>{a.courseTitle || a.courseId}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    loadChapters(e.target.value);
                  }}
                  className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  required
                >
                  <option value="" disabled>{subjects.length ? 'Select Subject' : 'No subjects — create one under Subject Management first'}</option>
                  {subjects.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Chapter Title</label>
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="e.g. Kinematics, Chemical Bonding"
                  className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Order Index</label>
                <input
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                  className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsBuilding(false)} className="px-4 py-2 text-sm font-semibold text-[var(--teacher-text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2">
                  <IconCheck size={16} /> {status || 'Save Chapter'}
                </button>
              </div>
            </form>
          </TeacherGlassPanel>
        ) : (
          <>
            {chapters.length === 0 ? (
              <TeacherEmptyState
                illustrationType="courses"
                title="No Chapters Configured"
                description="Break down subjects into targeted chapter units for lectures and notes."
                actionLabel="Create Chapter"
                onAction={() => setIsBuilding(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chapters.map((ch) => (
                  <TeacherGlassPanel key={ch.id} className="p-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="w-10 h-10 bg-teal-500/20 text-teal-600 rounded-xl flex items-center justify-center">
                        <IconLayers size={20} />
                      </div>
                      <span className="text-xs font-bold text-slate-500">Ch. {ch.sortOrder ?? ch.orderIndex}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--teacher-text)]">{ch.title}</h3>
                    <p className="text-xs text-[var(--teacher-text-muted)]">{courseTitle}</p>
                  </TeacherGlassPanel>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {!isBuilding && chapters.length > 0 && (
        <button onClick={() => setIsBuilding(true)} className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-teal-600 hover:bg-teal-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-500/40 transition-all hover:scale-110 z-50">
          <IconPlus size={28} />
        </button>
      )}
    </div>
  );
}