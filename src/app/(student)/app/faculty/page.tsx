'use client';

import { useState, useEffect } from 'react';
import FacultyCard from '@/components/faculty/FacultyCard';

export default function FacultyPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch('/api/student/mentors');
        const data = await res.json();
        if (data.success) setTeachers(data.data.mentors);
      } catch (err) {
        console.error('Fetch teachers error:', err);
      }
      setLoading(false);
    };
    fetchTeachers();
  }, []);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading faculty...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Our Faculty</h1>
        <p className="text-slate-500 mt-1">Meet our expert educators</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teachers.map(teacher => (
          <FacultyCard key={teacher.userId} teacher={teacher} />
        ))}
      </div>
    </div>
  );
}
