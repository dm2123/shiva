'use client';

import { useState } from 'react';
import {
  TeacherPageHeader, TeacherGlassPanel, TeacherStatusCapsule
} from '@/components/teacher/TeacherShared';
import TeacherEmptyState from '@/components/teacher/TeacherEmptyState';
import {
  IconTarget, IconPlus, IconSettings, IconCheck, IconTrash
} from '@/components/teacher/TeacherIcons';

export default function TeacherTestsClient({ initialTests = [], courses = [], userEmail = '' }: { initialTests?: any[], courses?: any[], userEmail?: string }) {
  const [tests, setTests] = useState<any[]>(initialTests);
  const [isBuilding, setIsBuilding] = useState(false);

  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [testTitle, setTestTitle] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [testDuration, setTestDuration] = useState(60);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(40);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveTest = async () => {
    setSaveStatus('Saving Test...');
    setErrorMsg(null);
    if (!courseId || !testTitle.trim()) {
      setErrorMsg('Select a course and enter a test title.');
      setSaveStatus(null);
      return;
    }
    try {
      const res = await fetch('/api/teacher/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          title: testTitle.trim(),
          description: testDescription.trim() || undefined,
          durationMinutes: Number(testDuration) || 60,
          totalMarks: Number(totalMarks) || 100,
          passingMarks: Number(passingMarks) || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const courseTitle = courses.find((c: any) => c.id === courseId)?.title || '—';
        setTests(prev => [{ ...data.data.test, courseTitle }, ...prev]);
        setSaveStatus('Test published!');
        setTimeout(() => { setIsBuilding(false); setSaveStatus(null); setTestTitle(''); setTestDescription(''); }, 1200);
      } else {
        setSaveStatus(null);
        setErrorMsg(data.error?.message || 'Failed to create test.');
      }
    } catch {
      setSaveStatus(null);
      setErrorMsg('Network error.');
    }
  };

  const deleteTest = async (id: string) => {
    const course = courses.find((c: any) => c.id === tests.find((t: any) => t.id === id)?.courseId);
    if (course) {
      setTests(prev => prev.filter(t => t.id !== id));
    }
  };

  if (isBuilding) {
    return (
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex justify-between items-center bg-[var(--teacher-surface)] p-4 rounded-2xl border border-[var(--teacher-border)] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-teal-500/20 text-teal-600 rounded-xl flex items-center justify-center">
              <IconTarget size={20} />
            </div>
            <div>
              <h2 className="font-bold text-[var(--teacher-text)]">New Assessment</h2>
              <p className="text-xs text-[var(--teacher-text-muted)]">Published immediately for enrolled students</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsBuilding(false)} className="px-4 py-2 text-sm font-semibold text-[var(--teacher-text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleSaveTest} disabled={saveStatus !== null} className="px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50">
              {saveStatus || 'Publish Test'}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl text-xs font-medium bg-red-50 text-red-800 border border-red-200">{errorMsg}</div>
        )}

        <div className="flex-1 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <TeacherGlassPanel className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Assigned Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                >
                  <option value="" disabled>Select Course</option>
                  {courses.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <input type="text" value={testTitle} onChange={(e) => setTestTitle(e.target.value)} placeholder="Assessment Title" className="w-full bg-transparent text-2xl font-bold text-[var(--teacher-text)] placeholder-slate-400 outline-none" />
              <textarea value={testDescription} onChange={(e) => setTestDescription(e.target.value)} placeholder="Instructions for students (optional)" rows={3} className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-3 text-sm text-[var(--teacher-text-muted)] placeholder-slate-500 outline-none resize-none" />
            </TeacherGlassPanel>

            <TeacherGlassPanel>
              <p className="text-sm text-[var(--teacher-text-muted)] leading-relaxed">
                Questions are selected automatically from the question bank for this course when a student starts the test.
                Add questions under the <b>Question Bank</b> module to populate this test.
              </p>
            </TeacherGlassPanel>
          </div>

          <div className="w-full lg:w-80 space-y-6">
            <TeacherGlassPanel className="space-y-6">
              <div className="flex items-center gap-2 text-[var(--teacher-text)] font-bold pb-4 border-b border-[var(--teacher-border)]">
                <IconSettings size={18} /> Test Settings
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Duration (minutes)</label>
                  <input type="number" value={testDuration} onChange={(e) => setTestDuration(Number(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Total Marks</label>
                  <input type="number" value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Passing Marks</label>
                  <input type="number" value={passingMarks} onChange={(e) => setPassingMarks(Number(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
            </TeacherGlassPanel>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <TeacherPageHeader
        title="Test & Assessments"
        description="Create mock tests, manage question banks, and evaluate student performance."
      />

      <div className="mt-6">
        {tests.length === 0 ? (
          <TeacherEmptyState
            illustrationType="courses"
            title="No Tests Created"
            description="Build powerful assessments to evaluate student progress and reinforce learning."
            actionLabel="Create Assessment"
            onAction={() => setIsBuilding(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test, index) => (
              <TeacherGlassPanel key={test.id || index} className="space-y-4">
                <div className="flex justify-between items-start">
                  <TeacherStatusCapsule status={test.status} />
                  <div className="text-xs font-bold text-[var(--teacher-text-muted)]">{test.durationMinutes} min</div>
                </div>
                <h3 className="text-lg font-bold text-[var(--teacher-text)] truncate">{test.title}</h3>
                <p className="text-xs text-teal-600 font-semibold">{test.courseTitle || '—'}</p>
                <p className="text-sm text-[var(--teacher-text-muted)] line-clamp-2">{test.description || 'No description'}</p>
                <div className="pt-4 border-t border-[var(--teacher-border)] flex items-center justify-between">
                  <div className="flex gap-3 text-[11px] font-bold text-[var(--teacher-text-muted)]">
                    <span>{test.totalMarks} marks</span>
                    {test.passingMarks != null && <span>Pass {test.passingMarks}</span>}
                  </div>
                  <button
                    onClick={() => deleteTest(test.id)}
                    className="text-slate-400 hover:text-red-500 p-1.5 transition-colors"
                    title="Remove"
                  >
                    <IconTrash size={17} />
                  </button>
                </div>
              </TeacherGlassPanel>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => setIsBuilding(true)} className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-teal-600 hover:bg-teal-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-500/40 transition-all hover:scale-110 z-50">
        <IconPlus size={28} />
      </button>
    </div>
  );
}