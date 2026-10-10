'use client';

import { useState } from 'react';

interface EnhancedDoubtFormProps {
  onSubmit: () => void;
  lectureId?: string;
}

export default function EnhancedDoubtForm({ onSubmit, lectureId }: EnhancedDoubtFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [category, setCategory] = useState('ACADEMIC');
  const [subject, setSubject] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and description are required');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/student/doubts/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), priority, category, subject, lectureId }),
      });

      const data = await res.json();
      if (data.success) {
        setTitle('');
        setContent('');
        setSubject('');
        onSubmit();
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError('Failed to submit doubt');
    }
    setSubmitting(false);
  };

  const slaInfo = {
    URGENT: '1 hour',
    HIGH: '4 hours',
    MEDIUM: '24 hours',
    LOW: '48 hours'
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-4">
      <h3 className="font-bold text-slate-900 dark:text-white">Ask a Doubt</h3>

      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Brief title for your doubt"
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
      />

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Describe your doubt in detail..."
        className="w-full h-24 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Priority</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            <option value="LOW">Low (48hr SLA)</option>
            <option value="MEDIUM">Medium (24hr SLA)</option>
            <option value="HIGH">High (4hr SLA)</option>
            <option value="URGENT">Urgent (1hr SLA)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            <option value="ACADEMIC">Academic</option>
            <option value="TECHNICAL">Technical</option>
            <option value="BILLING">Billing</option>
            <option value="GENERAL">General</option>
          </select>
        </div>
      </div>

      <input
        type="text"
        value={subject}
        onChange={e => setSubject(e.target.value)}
        placeholder="Subject (optional)"
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
      />

      <p className="text-xs text-slate-500">
        SLA: Response expected within <strong>{slaInfo[priority as keyof typeof slaInfo]}</strong>
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={submit}
        disabled={submitting || !title.trim() || !content.trim()}
        className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Doubt'}
      </button>
    </div>
  );
}
