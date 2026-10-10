'use client';

import { useState, useEffect } from 'react';
import StarRating from '@/components/reviews/StarRating';

interface FacultyProfileProps {
  teacherId: string;
}

export default function FacultyProfile({ teacherId }: FacultyProfileProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await fetch(`/api/public/teachers/${teacherId}`);
        const result = await res.json();
        if (result.success) setData(result.data);
      } catch (err) {
        console.error('Fetch teacher error:', err);
      }
      setLoading(false);
    };
    fetchTeacher();
  }, [teacherId]);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading...</div>;
  if (!data) return <div className="text-center py-8 text-slate-500">Teacher not found</div>;

  const { teacher, courses, liveClasses, doubtStats, reviews, avgRating, totalReviews } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-4xl font-bold">{teacher.name?.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{teacher.name}</h1>
            <p className="text-indigo-200">{teacher.specialization}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm">⭐ {avgRating} ({totalReviews} reviews)</span>
              <span className="text-sm">{teacher.experience} years experience</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{courses.length}</p>
          <p className="text-xs text-slate-500">Courses</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{liveClasses.completed}</p>
          <p className="text-xs text-slate-500">Live Classes</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{doubtStats.resolved}</p>
          <p className="text-xs text-slate-500">Doubts Resolved</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">
            {doubtStats.avgResponseMinutes ? `${Math.round(doubtStats.avgResponseMinutes)}m` : '-'}
          </p>
          <p className="text-xs text-slate-500">Avg Response</p>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-2">About</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">{teacher.bio}</p>
        {teacher.qualifications && (
          <p className="text-sm text-slate-500 mt-2">Qualifications: {teacher.qualifications}</p>
        )}
      </div>

      {/* Courses */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Courses</h3>
        {courses.length === 0 ? (
          <p className="text-sm text-slate-500">No courses yet</p>
        ) : (
          <div className="space-y-2">
            {courses.map((course: any) => (
              <div key={course.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{course.title}</p>
                  <p className="text-xs text-slate-500">{course.courseType} • {course.difficulty}</p>
                </div>
                <span className="text-xs text-slate-500">{course.enrolledStudents} students</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Student Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-500">No reviews yet</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review: any) => (
              <div key={review.id} className="border-b pb-3 last:border-0">
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-xs text-slate-500">{review.studentName}</span>
                </div>
                {review.content && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{review.content}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
