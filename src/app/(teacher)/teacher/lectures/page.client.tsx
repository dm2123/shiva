'use client';

import { useState } from 'react';
import {
  TeacherPageHeader, TeacherGlassPanel, TeacherStatusCapsule
} from '@/components/teacher/TeacherShared';
import TeacherEmptyState from '@/components/teacher/TeacherEmptyState';
import {
  IconVideo, IconPlus, IconCheck, IconTrash
} from '@/components/teacher/TeacherIcons';

interface Lecture {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  courseTitle: string;
  subjectTitle: string;
  chapterTitle: string;
  chapterId: string;
  durationSeconds: number;
  isPreviewable: boolean;
  sortOrder: number;
}

interface TeacherLecturesClientProps {
  courses: any[];
  chapters: any[];
  initialLectures: Lecture[];
}

function fmtDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function TeacherLecturesClient({ courses, chapters, initialLectures }: TeacherLecturesClientProps) {
  const [lectures, setLectures] = useState<Lecture[]>(initialLectures);
  const [activeCourseId, setActiveCourseId] = useState<string | 'ALL'>(initialLectures[0]?.courseId || 'ALL');
  const [isBuilding, setIsBuilding] = useState(false);

  const [chapterId, setChapterId] = useState('');
  const [lecTitle, setLecTitle] = useState('');
  const [lecDescription, setLecDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [durationSec, setDurationSec] = useState(1800);
  const [isPreviewable, setIsPreviewable] = useState(false);
  const [sortOrder, setSortOrder] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredLectures = activeCourseId === 'ALL'
    ? lectures
    : lectures.filter(l => l.courseId === activeCourseId);

  const chapterOptions = chapterId
    ? chapters.filter((c: any) => c.courseId === chapters.find((x: any) => x.id === chapterId)?.courseId)
    : [];

  const handleCreate = async () => {
    setStatus('Saving...');
    setErrorMsg(null);
    if (!chapterId || !lecTitle.trim()) {
      setErrorMsg('Select a chapter and enter a lecture title.');
      setStatus(null);
      return;
    }
    try {
      const res = await fetch('/api/teacher/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          title: lecTitle.trim(),
          description: lecDescription.trim() || undefined,
          videoUrl: videoUrl.trim() || undefined,
          durationSeconds: Number(durationSec) || 0,
          isPreviewable: !!isPreviewable,
          sortOrder: Number(sortOrder) || 1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const ch = chapters.find((c: any) => c.id === chapterId);
        setLectures(prev => [
          ...prev,
          {
            id: data.data.lecture.id,
            title: lecTitle.trim(),
            description: lecDescription.trim() || null,
            courseId: ch?.courseId || '',
            courseTitle: ch?.courseTitle || '—',
            subjectTitle: ch?.subjectTitle || '—',
            chapterTitle: ch?.title || '—',
            chapterId,
            durationSeconds: Number(durationSec) || 0,
            isPreviewable: !!isPreviewable,
            sortOrder: Number(sortOrder) || 1,
          },
        ]);
        setStatus('Lecture created!');
        setTimeout(() => { setIsBuilding(false); setStatus(null); setLecTitle(''); setLecDescription(''); setVideoUrl(''); setChapterId(''); }, 1200);
      } else {
        setStatus(null);
        setErrorMsg(data?.error?.message || 'Failed to create lecture.');
      }
    } catch {
      setStatus(null);
      setErrorMsg('Network error.');
    }
  };

  return (
    <div className="relative">
      <TeacherPageHeader
        title="Lecture Management"
        description="Upload video content, manage lecture metadata, and organize your syllabus."
      />

      <div className="mt-6 space-y-6">
        <div className="flex flex-wrap gap-2 items-center bg-[var(--teacher-surface)] p-3 rounded-2xl border border-[var(--teacher-border)]">
          <button
            onClick={() => setActiveCourseId('ALL')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl ${
              activeCourseId === 'ALL' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'text-[var(--teacher-text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Courses ({lectures.length})
          </button>
          {courses.map((c: any) => (
            <button
              key={c.id}
              onClick={() => setActiveCourseId(c.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl ${
                activeCourseId === c.id ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'text-[var(--teacher-text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>

        {isBuilding && (
          <TeacherGlassPanel className="max-w-3xl mx-auto p-6 space-y-5">
            <h3 className="text-xl font-bold text-[var(--teacher-text)]">Create New Lecture</h3>

            {errorMsg && (
              <div className="p-3 rounded-xl text-xs font-medium bg-red-50 text-red-800 border border-red-200">{errorMsg}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Chapter</label>
                <select
                  value={chapterId}
                  onChange={(e) => setChapterId(e.target.value)}
                  className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                >
                  <option value="">Select Chapter ({chapters.length} across your courses)</option>
                  {chapters.map((ch: any) => (
                    <option key={ch.id} value={ch.id}>{ch.courseTitle} · {ch.subjectTitle} · {ch.title}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Title</label>
                <input type="text" value={lecTitle} onChange={(e) => setLecTitle(e.target.value)} placeholder="e.g. Percentage Introduction" className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Description</label>
                <textarea value={lecDescription} onChange={(e) => setLecDescription(e.target.value)} rows={3} placeholder="What will students learn?" className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500 resize-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Video URL</label>
                <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://... (or YouTube embed URL)" className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Duration (seconds)</label>
                <input type="number" value={durationSec} onChange={(e) => setDurationSec(Number(e.target.value))} className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Sort Order</label>
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-[var(--teacher-text-muted)] cursor-pointer">
              <input type="checkbox" checked={isPreviewable} onChange={(e) => setIsPreviewable(e.target.checked)} className="accent-teal-600" />
              Previewable without enrollment
            </label>

            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setIsBuilding(false)} className="px-4 py-2 text-sm font-semibold text-[var(--teacher-text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={status !== null} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                <IconCheck size={16} /> {status || 'Create Lecture'}
              </button>
            </div>
          </TeacherGlassPanel>
        )}

        {filteredLectures.length === 0 ? (
          <TeacherEmptyState
            illustrationType="lectures"
            title={isBuilding ? '' : 'No lectures found'}
            description="Upload video content to start building your course syllabus."
            actionLabel="Create Lecture"
            onAction={() => setIsBuilding(true)}
          />
        ) : (
          <div className="bg-[var(--teacher-surface)] border border-[var(--teacher-border)] rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-[var(--teacher-border)]">
              {filteredLectures.map(lecture => (
                <div key={lecture.id} className="flex items-center justify-between p-4 hover:bg-[var(--teacher-primary-light)] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center">
                      <IconVideo size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--teacher-text)]">{lecture.title}</h4>
                      <p className="text-xs text-[var(--teacher-text-muted)] mt-1">
                        {lecture.courseTitle} · {lecture.subjectTitle} · {lecture.chapterTitle} · {fmtDuration(lecture.durationSeconds)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {lecture.isPreviewable && (
                      <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-amber-500/15 text-amber-600">Preview</span>
                    )}
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-600">Published</span>
                    <button className="text-slate-400 hover:text-red-500 p-1.5 transition-colors" title="Remove">
                      <IconTrash size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!isBuilding && (
        <button onClick={() => setIsBuilding(true)} className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-teal-600 hover:bg-teal-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-500/40 transition-all hover:scale-110 z-50">
          <IconPlus size={28} />
        </button>
      )}
    </div>
  );
}