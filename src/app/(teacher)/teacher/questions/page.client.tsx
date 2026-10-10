'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TeacherPageHeader, TeacherGlassPanel
} from '@/components/teacher/TeacherShared';
import TeacherEmptyState from '@/components/teacher/TeacherEmptyState';
import {
  IconPlus, IconSearch, IconList, IconSettings, IconCheck, IconTrash
} from '@/components/teacher/TeacherIcons';

const EMPTY_OPTIONS = [
  { id: 'a', text: '' },
  { id: 'b', text: '' },
  { id: 'c', text: '' },
  { id: 'd', text: '' },
];

export default function TeacherQuestionsClient({ courses = [] as any[] }) {
  const [isBuilding, setIsBuilding] = useState(false);

  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [chapters, setChapters] = useState<any[]>([]);
  const [chapterId, setChapterId] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('MCQ');
  const [marks, setMarks] = useState(4);
  const [negativeMarks, setNegativeMarks] = useState(1);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [options, setOptions] = useState(EMPTY_OPTIONS);
  const [correctAnswer, setCorrectAnswer] = useState('a');
  const [explanation, setExplanation] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadSubjectsForCourse = useCallback(async (cid: string) => {
    setSubjects([]);
    setSubjectId('');
    setChapters([]);
    setChapterId('');
    setQuestions([]);
    if (!cid) return;
    try {
      const res = await fetch(`/api/teacher/subjects?courseId=${cid}`);
      const data = await res.json();
      if (data.success) setSubjects(data.data.subjects || []);
    } catch { /* ignore */ }
  }, []);

  const loadChaptersForSubject = useCallback(async (sid: string) => {
    setChapters([]);
    setChapterId('');
    setQuestions([]);
    if (!sid) return;
    try {
      const res = await fetch(`/api/teacher/chapters?subjectId=${sid}`);
      const data = await res.json();
      if (data.success) setChapters(data.data.chapters || []);
    } catch { /* ignore */ }
  }, []);

  const loadQuestionsForChapter = useCallback(async (chid: string) => {
    setQuestions([]);
    if (!chid) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/questions?chapterId=${chid}`);
      const data = await res.json();
      if (data.success) setQuestions(data.data.questions || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (courseId) loadSubjectsForCourse(courseId);
  }, [courseId, loadSubjectsForCourse]);

  useEffect(() => {
    if (subjectId) loadChaptersForSubject(subjectId);
  }, [subjectId, loadChaptersForSubject]);

  useEffect(() => {
    if (chapterId) loadQuestionsForChapter(chapterId);
  }, [chapterId, loadQuestionsForChapter]);

  const handleSave = async () => {
    setSaveStatus('Saving...');
    setErrorMsg(null);
    const filled = options.filter((o) => o.text.trim());
    if (!title.trim() || filled.length < 2) {
      setErrorMsg('Enter the question and at least two options.');
      setSaveStatus(null);
      return;
    }
    if (type === 'MCQ' && !correctAnswer) {
      setErrorMsg('Select the correct answer.');
      setSaveStatus(null);
      return;
    }
    const target = chapterId || subjectId;
    if (!target) {
      setErrorMsg('Select a subject or chapter to attach the question to.');
      setSaveStatus(null);
      return;
    }
    try {
      const res = await fetch('/api/teacher/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(chapterId ? { chapterId } : { subjectId }),
          title: title.trim(),
          type,
          options: { options: options.filter((o) => o.text.trim()).map((o) => ({ id: o.id, text: o.text.trim() })) },
          correctAnswer,
          explanation: explanation.trim() || undefined,
          difficulty,
          marks: Number(marks) || 4,
          negativeMarks: Number(negativeMarks) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('Question saved!');
        setQuestions(prev => [...prev, data.data.question]);
        setTimeout(() => { setIsBuilding(false); setSaveStatus(null); setTitle(''); setExplanation(''); setOptions(EMPTY_OPTIONS); setCorrectAnswer('a'); }, 1200);
      } else {
        setSaveStatus(null);
        setErrorMsg(data?.error?.message || 'Failed to save question.');
      }
    } catch {
      setSaveStatus(null);
      setErrorMsg('Network error.');
    }
  };

  if (isBuilding) {
    return (
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex justify-between items-center bg-[var(--teacher-surface)] p-4 rounded-2xl border border-[var(--teacher-border)] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-teal-500/20 text-teal-600 rounded-xl flex items-center justify-center">
              <IconList size={20} />
            </div>
            <div>
              <h2 className="font-bold text-[var(--teacher-text)]">New Question</h2>
              <p className="text-xs text-[var(--teacher-text-muted)]">
                {chapterId ? 'Attached to a chapter' : subjectId ? 'Attached to a subject' : 'Select a subject/chapter'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsBuilding(false)} className="px-4 py-2 text-sm font-semibold text-[var(--teacher-text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saveStatus !== null} className="px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50">
              {saveStatus || 'Save Question'}
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
                  onChange={(e) => {
                    setCourseId(e.target.value);
                    loadSubjectsForCourse(e.target.value);
                  }}
                  className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                >
                  <option value="">Select Course</option>
                  {courses.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => {
                      setSubjectId(e.target.value);
                      loadChaptersForSubject(e.target.value);
                    }}
                    className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  >
                    <option value="">No subject filter</option>
                    {subjects.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Chapter</label>
                  <select
                    value={chapterId}
                    onChange={(e) => { setChapterId(e.target.value); loadQuestionsForChapter(e.target.value); }}
                    className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500"
                  >
                    <option value="">No chapter filter</option>
                    {chapters.map((ch: any) => (
                      <option key={ch.id} value={ch.id}>{ch.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Question Text</label>
                <textarea value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Write your question here..." rows={3} className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500 transition-colors resize-none"></textarea>
              </div>

              {type === 'MCQ' && (
                <div>
                  <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Answer Options</label>
                  <div className="space-y-2">
                    {options.map((opt, i) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCorrectAnswer(opt.id)}
                          className={`w-9 h-9 rounded-lg flex-shrink-0 text-xs font-black border transition-colors ${
                            correctAnswer === opt.id
                              ? 'bg-teal-600 text-white border-teal-600'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent hover:border-teal-400'
                          }`}
                          title="Mark as correct"
                        >
                          {opt.id.toUpperCase()}
                        </button>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const next = [...options];
                            next[i] = { ...next[i], text: e.target.value };
                            setOptions(next);
                          }}
                          placeholder={`Option ${opt.id.toUpperCase()}`}
                          className="flex-1 bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-500"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-[var(--teacher-text-muted)] mt-1">Click a letter to mark the correct answer.</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Explanation (shown to students after review)</label>
                <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2} className="w-full bg-[rgba(15,23,42,0.05)] dark:bg-[rgba(15,23,42,0.5)] border border-[var(--teacher-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500 resize-none"></textarea>
              </div>
            </TeacherGlassPanel>
          </div>

          <div className="w-full lg:w-80 space-y-6">
            <TeacherGlassPanel className="space-y-6">
              <div className="flex items-center gap-2 text-[var(--teacher-text)] font-bold pb-4 border-b border-[var(--teacher-border)]">
                <IconSettings size={18} /> Metadata
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="MCQ">Single Choice (MCQ)</option>
                    <option value="MULTIPLE_CORRECT">Multiple Correct Option</option>
                    <option value="NUMERICAL">Numerical Value</option>
                    <option value="SUBJECTIVE">Subjective/Essay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Marks (+)</label>
                  <input type="number" value={marks} onChange={(e) => setMarks(Number(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Negative Marks (-)</label>
                  <input type="number" value={negativeMarks} onChange={(e) => setNegativeMarks(Number(e.target.value))} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Difficulty</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500">
                    <option>EASY</option>
                    <option>MEDIUM</option>
                    <option>HARD</option>
                  </select>
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
        title="Question Bank"
        description="Build and manage questions for tests, DPPs, and structured daily practice."
      />

      <div className="mt-6 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-72">
          <TeacherGlassPanel className="p-4 space-y-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search..." className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-9 pr-4 text-xs outline-none" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Course</label>
              <select
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  loadSubjectsForCourse(e.target.value);
                }}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-xs outline-none"
              >
                <option value="">All Courses</option>
                {courses.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Subject</label>
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  loadChaptersForSubject(e.target.value);
                }}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-xs outline-none"
              >
                <option value="">All Subjects</option>
                {subjects.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[var(--teacher-text-muted)] uppercase mb-2">Difficulty</label>
              <div className="flex gap-2">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded cursor-pointer font-semibold">Easy</span>
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded cursor-pointer font-semibold">Medium</span>
                <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded cursor-pointer font-semibold">Hard</span>
              </div>
            </div>
          </TeacherGlassPanel>
        </div>

        <div className="flex-1">
          {loading ? (
            <p className="text-sm text-[var(--teacher-text-muted)]">Loading questions...</p>
          ) : questions.length === 0 ? (
            <TeacherEmptyState
              illustrationType="lectures"
              title="Question Bank Empty"
              description="Create authoritative questions that can be reused across DPPs and Tests."
              actionLabel="Create First Question"
              onAction={() => setIsBuilding(true)}
            />
          ) : (
            <div className="bg-[var(--teacher-surface)] border border-[var(--teacher-border)] rounded-2xl overflow-hidden shadow-sm">
              <div className="divide-y divide-[var(--teacher-border)]">
                {questions.map((q) => (
                  <div key={q.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[var(--teacher-primary-light)] transition-colors">
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--teacher-text)] text-sm leading-snug line-clamp-2">{q.title}</p>
                      <p className="text-xs text-[var(--teacher-text-muted)] mt-1">
                        {q.type} · {q.marks} marks / −{q.negativeMarks || 0} · {q.difficulty}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-teal-500/15 text-teal-600">
                        {q.correctAnswer?.toUpperCase()}
                      </span>
                      <button className="text-slate-400 hover:text-red-500 p-1.5 transition-colors" title="Remove">
                        <IconTrash size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setIsBuilding(true)}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-teal-500/20"
          >
            <IconPlus size={18} /> New Question
          </button>
        </div>
      </div>
    </div>
  );
}