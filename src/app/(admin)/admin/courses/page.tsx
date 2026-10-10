'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Course } from '@/types/models';
import { safeFetch } from '@/lib/api-client';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(4999);
  const [thumbnail, setThumbnail] = useState('');
  const [fileLoading, setFileLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setFileLoading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
    const data = await res.json();
    
    if (data.success) {
      setThumbnail(data.url);
    } else {
      alert('Upload failed');
    }
    setFileLoading(false);
  };
  const [isPublished, setIsPublished] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const deleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    const res = await safeFetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
    if (res.success) {
      fetchCourses();
    } else {
      alert('Failed to delete course');
    }
  };

  const fetchCourses = async () => {
    const res = await safeFetch('/api/admin/courses');
    if (res.success && res.data?.courses) {
      setCourses(res.data.courses);
    }
  };


  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setLoading(true);

    const res = await safeFetch('/api/admin/courses', {
      method: 'POST',
        body: JSON.stringify({
        title,
        slug,
        description,
        thumbnailUrl: thumbnail,
        price: Number(price),
        status: isPublished ? 'PUBLISHED' : 'DRAFT',
        isPublished,
      }),
    });

    if (!res.success) {
      setStatusMsg({ type: 'error', text: res.error?.message || 'Failed to create course.' });
    } else {
      setStatusMsg({ type: 'success', text: `Course '${res.data.course.title}' created successfully!` });
      setTitle('');
      setSlug('');
      setDescription('');
      setThumbnail('');
      fetchCourses();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-extrabold text-slate-900">Global Course Approval & Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Create New Course</h2>

          {statusMsg && (
            <div
              className={`p-3 mb-4 rounded text-xs border ${
                statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setSlug(generateSlug(e.target.value));
                  }}
                  required
                  placeholder="e.g. JEE Advanced Physics 2026"
                  className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slug URL</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                placeholder="e.g. jee-adv-physics-2026"
                className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course Thumbnail</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              />
              {fileLoading && <p className="text-[10px] text-blue-500 mt-1">Uploading...</p>}
              {thumbnail && <img src={thumbnail} alt="preview" className="mt-2 h-20 w-auto rounded border" />}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={10}
                rows={3}
                placeholder="Comprehensive syllabus overview (min 10 characters)..."
                className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price (INR)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={0}
                className="w-full px-3 py-2 border rounded text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="publishCheck"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded"
              />
              <label htmlFor="publishCheck" className="text-xs font-medium text-slate-700">
                Publish Immediately to Public Catalog
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-red-950 text-white rounded text-xs font-bold hover:bg-black transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </div>

        {/* Existing Courses Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Existing Courses Directory</h2>
          {courses.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-4 text-center">No courses created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 uppercase text-[10px] font-bold text-slate-500">
                  <tr>
                    <th className="p-3">Title</th>
                    <th className="p-3">Slug</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{course.title}</td>
                      <td className="p-3 font-mono text-slate-500">{course.slug}</td>
                      <td className="p-3 font-bold">₹{course.price}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            course.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {course.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button 
                          onClick={() => deleteCourse(course.id)} 
                          className="px-2 py-1 bg-red-100 text-red-600 font-bold rounded hover:bg-red-200 transition text-[10px]"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
