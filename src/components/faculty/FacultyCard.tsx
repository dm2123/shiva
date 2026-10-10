'use client';

import Link from 'next/link';

interface FacultyCardProps {
  teacher: {
    userId: string;
    name: string;
    specialization: string;
    experience: number;
    bio: string;
  };
  stats?: {
    totalClasses: number;
    avgRating: number;
    totalStudents: number;
  };
}

export default function FacultyCard({ teacher, stats }: FacultyCardProps) {
  return (
    <Link
      href={`/app/faculty/${teacher.userId}`}
      className="block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-white">{teacher.name?.charAt(0) || '?'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 dark:text-white">{teacher.name}</h3>
          <p className="text-sm text-indigo-600">{teacher.specialization}</p>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{teacher.bio}</p>
          <div className="flex gap-4 mt-2 text-xs text-slate-500">
            <span>{teacher.experience} years exp</span>
            {stats && (
              <>
                <span>⭐ {stats.avgRating.toFixed(1)}</span>
                <span>📚 {stats.totalClasses} classes</span>
                <span>👥 {stats.totalStudents} students</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
