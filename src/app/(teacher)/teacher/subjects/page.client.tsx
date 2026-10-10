'use client';

import { useState, useEffect, useCallback } from 'react';
import { TeacherPageHeader, TeacherGlassPanel } from '@/components/teacher/TeacherShared';
import TeacherEmptyState from '@/components/teacher/TeacherEmptyState';
import { IconBookOpen, IconPlus, IconCheck } from '@/components/teacher/TeacherIcons';

export default function TeacherSubjectsClient({ initialAssignments = [] }: { initialAssignments?: any[] }) {
  const [isBuilding, setIsBuilding] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(initialAssignments[0]?.courseId || '');
  const [subjectTitle, setSubjectTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadSubjects = useCallback(async (cid: string) => {
    setSubjects([]);
    if (!cid) return;
    try {
      const res = await fetch(`/api/teacher/subjects?courseId=${cid}`);
      const data = await res.json();
      if (data.success) setSubjects(data.data.subjects || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (selectedCourseId) loadSubjects(selectedCourseId);
  }, [selectedCourseId, loadSubjects]);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!selectedCourseId || !subjectTitle.trim()) {
      setErrorMsg('Select a course and enter a subject title.');
      return;
    }
    setStatus('Creating...');

    try {
      const res = await fetch('/api/teacher/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourseId,
          name: subjectTitle.trim(),
          code: subjectCode.trim() || subjectTitle.trim().substring(0, 4).toUpperCase(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubjects(prev => [...prev, data.data.subject]);
        setStatus('Subject Created!');
        setTimeout(() => {
          setIsBuilding(false);
          setStatus(null);
          setSubjectTitle('');
          setSubjectCode('');
        }, 1000);
      } else {
        setStatus(null);
        setErrorMsg(data.error?.message || 'Error creating subject');
      }
    } catch {
      setStatus(null);
      setErrorMsg('Network error');
    }
  };

  return (
    <div className="relative">
      <TeacherPageHeader
        title="Subject Management"
        description="Organize your assigned courses into structured academic subjects."
      />

      <TeacherGlassPanel className="mt-6 max-w-xl p-4 space-y-3">
        <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase">Scope</label>
        <select
          value={selectedCourseId}
          onChange={(e) => {
            setSelectedCourseId(e.target.value);
            loadSubjects(e.target.value);
          }}
          className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
        >
          <option value="">Select a course</option>
          {initialAssignments.map((a: any) => (
            <option key={a.courseId} value={a.courseId}>{a.courseTitle || a.courseId}</option>
          ))}
        </select>
      </TeacherGlassPanel>

      <div className="mt-6">
        {isBuilding ? (
          <TeacherGlassPanel className="max-w-2xl mx-auto p-6 space-y-6">
            <h3 className="text-xl font-bold text-[var(--teacher-text)]">Create New Subject</h3>

            {errorMsg && (
              <div className="p-3 rounded-xl text-xs font-medium bg-red-50 text-red-800 border border-red-200">{errorMsg}</div>
            )}

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Subject Title</label>
                <input
                  type="text"
                  value={subjectTitle}
                  onChange={(e) => setSubjectTitle(e.target.value)}
                  placeholder="e.g. Physics, Organic Chemistry"
                  className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Subject Code / Tag</label>
                <input
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="e.g. PHY101"
                  className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsBuilding(false)} className="px-4 py-2 text-sm font-semibold text-[var(--teacher-text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2">
                  <IconCheck size={16} /> {status || 'Save Subject'}
                </button>
              </div>
            </form>
          </TeacherGlassPanel>
        ) : (
          <>
            {subjects.length === 0 ? (
              <TeacherEmptyState
                illustrationType="courses"
                title="No Subjects Configured"
                description="Add subject modules to structure your chapters and lectures inside assigned courses."
                actionLabel="Create Subject"
                onAction={() => setIsBuilding(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((sub) => (
                  <TeacherGlassPanel key={sub.id} className="p-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="w-10 h-10 bg-teal-500/20 text-teal-600 rounded-xl flex items-center justify-center">
                        <IconBookOpen size={20} />
                      </div>
                      <span className="text-xs font-mono px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">{sub.code}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--teacher-text)]">{sub.name}</h3>
                  </TeacherGlassPanel>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {!isBuilding && subjects.length > 0 && (
        <button onClick={() => setIsBuilding(true)} className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-teal-600 hover:bg-teal-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-500/40 transition-all hover:scale-110 z-50">
          <IconPlus size={28} />
        </button>
      )}
    </div>
  );
}