'use client';

import { useState, useEffect } from 'react';


interface HandwrittenNote {
  id: number;
  title: string;
  subject: string;
  topic: string;
  fileUrl: string;
  lectureTitle?: string;
  createdAt: string;
}

export default function HandwrittenNotesUpload() {
  const [notes, setNotes] = useState<HandwrittenNote[]>([]);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [lectureId, setLectureId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterTopic, setFilterTopic] = useState('');

  const fetchNotes = async () => {
    try {
      const params = new URLSearchParams();
      if (filterSubject) params.set('subject', filterSubject);
      if (filterTopic) params.set('topic', filterTopic);

      const res = await fetch(`/api/student/handwritten-notes?${params}`);
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [filterSubject, filterTopic]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !topic || !file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const { url } = await uploadRes.json();

      const res = await fetch('/api/student/handwritten-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, subject, topic, fileUrl: url, lectureId: lectureId || undefined }),
      });

      if (res.ok) {
        setTitle('');
        setSubject('');
        setTopic('');
        setLectureId('');
        setFile(null);
        fetchNotes();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Handwritten Notes</h2>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Upload New Note</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <input
              type="text"
              placeholder="Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <input
              type="text"
              placeholder="Lecture ID (optional)"
              value={lectureId}
              onChange={(e) => setLectureId(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="border rounded-lg px-4 py-2"
              required
            />
            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Filter by subject..."
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="text"
          placeholder="Filter by topic..."
          value={filterTopic}
          onChange={(e) => setFilterTopic(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-gray-500">No notes uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow">
              {note.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={note.fileUrl} alt={note.title} className="w-full h-40 object-cover rounded-lg mb-3" />
              ) : (
                <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">PDF Document</span>
                </div>
              )}
              <h4 className="font-semibold text-gray-900">{note.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{note.subject} — {note.topic}</p>
              {note.lectureTitle && (
                <p className="text-xs text-gray-400 mt-1">Lecture: {note.lectureTitle}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
              <a
                href={note.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm text-blue-600 hover:underline"
              >
                Open
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
