'use client';

import { useState } from 'react';
import CourseComparison from '@/components/courses/CourseComparison';

export default function ComparePage() {
  const [courseIds, setCourseIds] = useState<string[]>(['', '']);
  const [compare, setCompare] = useState(false);

  const addCourse = () => {
    if (courseIds.length < 4) {
      setCourseIds([...courseIds, '']);
    }
  };

  const removeCourse = (index: number) => {
    if (courseIds.length > 2) {
      setCourseIds(courseIds.filter((_, i) => i !== index));
    }
  };

  const updateCourse = (index: number, value: string) => {
    const updated = [...courseIds];
    updated[index] = value;
    setCourseIds(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Compare Courses</h1>

      {/* Course Selection */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 dark:text-white">Select Courses</h3>
          {courseIds.length < 4 && (
            <button onClick={addCourse} className="text-sm text-indigo-600 hover:underline">
              + Add Course
            </button>
          )}
        </div>
        <div className="space-y-2">
          {courseIds.map((id, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={id}
                onChange={e => updateCourse(i, e.target.value)}
                placeholder={`Course ${i + 1} ID`}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
              {courseIds.length > 2 && (
                <button onClick={() => removeCourse(i)} className="text-red-500 hover:text-red-600">
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => setCompare(true)}
          disabled={courseIds.filter(id => id.trim()).length < 2}
          className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Compare
        </button>
      </div>

      {/* Comparison Table */}
      {compare && <CourseComparison courseIds={courseIds.filter(id => id.trim())} />}
    </div>
  );
}
