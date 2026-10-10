'use client';

import { useParams } from 'next/navigation';
import FacultyProfile from '@/components/faculty/FacultyProfile';
import Link from 'next/link';

export default function FacultyDetailPage() {
  const params = useParams();
  const teacherId = params.id as string;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/app/faculty" className="text-indigo-600 hover:underline text-sm">
        ← Back to Faculty
      </Link>
      <FacultyProfile teacherId={teacherId} />
    </div>
  );
}
