'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  courseType: string;
  difficulty: string;
  durationWeeks: number;
  enrolledStudents: number;
  avgRating: number;
  totalReviews: number;
}

interface CourseComparisonProps {
  courseIds: string[];
}

export default function CourseComparison({ courseIds }: CourseComparisonProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const results = await Promise.all(
          courseIds.map(id => fetch(`/api/public/courses/${id}`).then(r => r.json()))
        );
        setCourses(results.filter(r => r.success).map(r => r.data.course));
      } catch (err) {
        console.error('Fetch courses error:', err);
      }
      setLoading(false);
    };
    if (courseIds.length > 0) fetchCourses();
  }, [courseIds]);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading...</div>;
  if (courses.length < 2) return <div className="text-center py-8 text-slate-500">Select 2+ courses to compare</div>;

  const features = [
    { label: 'Price', key: 'price', format: (v: number) => `₹${v}` },
    { label: 'Type', key: 'courseType' },
    { label: 'Difficulty', key: 'difficulty' },
    { label: 'Duration', key: 'durationWeeks', format: (v: number) => `${v} weeks` },
    { label: 'Students', key: 'enrolledStudents' },
    { label: 'Rating', key: 'avgRating', format: (v: number) => `${v?.toFixed(1) || 'N/A'} ⭐` },
    { label: 'Reviews', key: 'totalReviews' },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left text-sm font-medium text-slate-500 w-32">Feature</th>
              {courses.map(course => (
                <th key={course.id} className="p-4 text-center">
                  <Link href={`/app/courses/${course.id}`} className="font-bold text-slate-900 dark:text-white hover:text-indigo-600">
                    {course.title}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map(feature => (
              <tr key={feature.key} className="border-b last:border-0">
                <td className="p-4 text-sm text-slate-500">{feature.label}</td>
                {courses.map(course => (
                  <td key={course.id} className="p-4 text-center text-sm text-slate-900 dark:text-white">
                    {feature.format
                      ? feature.format(course[feature.key as keyof Course] as number)
                      : course[feature.key as keyof Course] || '-'}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="p-4"></td>
              {courses.map(course => (
                <td key={course.id} className="p-4 text-center">
                  <Link
                    href={`/app/checkout/${course.id}`}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                  >
                    Enroll Now
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
