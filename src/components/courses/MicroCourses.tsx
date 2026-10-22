'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string;
  courseType: string;
  durationWeeks: number;
  difficulty: string;
}

export default function MicroCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('MICRO');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`/api/public/courses?courseType=${filter}`);
        const data = await res.json();
        if (data.success) setCourses(data.data.courses);
      } catch (err) {
        console.error('Fetch courses error:', err);
      }
      setLoading(false);
    };
    fetchCourses();
  }, [filter]);

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading courses...</div>;
  }

  const difficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        {['MICRO', 'FULL', 'CRASH'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === type
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {type === 'MICRO' ? 'Micro Courses' : type === 'FULL' ? 'Full Courses' : 'Crash Courses'}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No courses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <div
              key={course.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">{course.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{course.description}</p>
                  <div className="flex gap-2 mt-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${difficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                    <span className="text-xs text-slate-500">{course.durationWeeks} weeks</span>
                  </div>
                </div>
              </div>
              <Link
                href={`/app/courses/${course.id}`}
                className="block mt-4 text-center py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
              >
                View Course
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
