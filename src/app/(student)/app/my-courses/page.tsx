import { cookies } from 'next/headers';
import { parseSessionCookie, validateServerSession } from '@/lib/auth';
import { getStudentEnrollmentsDb, findCourseByIdDb } from '@/lib/db';
import StudentCourseCard from '@/components/student/StudentCourseCard';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { StudentPageHeader } from '@/components/student/StudentShared';
import { IconBook } from '@/components/student/StudentIcons';

export const revalidate = 0;

export default async function MyCoursesPage() {
  const cookieHeader = cookies().toString();
  const sessionId = parseSessionCookie(cookieHeader);
  const session = sessionId ? await validateServerSession(sessionId) : null;
  if (!session) return null;

  // Since DB only has getStudentEnrollmentsDb(courseId), this is inefficient.
  // I'll need to fetch all courses and check enrollment.
  const allCourses = await (import('@/lib/db')).then(db => db.listCoursesDb(true));
  const myCourses = [];

  for (const course of allCourses) {
    const isEnrolled = await (import('@/lib/db')).then(db => db.isStudentEnrolledInCourseDb(session.userId, course.id));
    if (isEnrolled) {
      myCourses.push(course);
    }
  }

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="My Courses"
        description="Your active enrollments and ongoing learning progress."
      />

      {myCourses.length === 0 ? (
        <StudentEmptyState
          icon={<IconBook size={24} />}
          title="No Active Enrollments"
          description="You haven't enrolled in any courses yet."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {myCourses.map((course) => (
            <StudentCourseCard key={course.id} course={course} isEnrolled={true} />
          ))}
        </div>
      )}
    </div>
  );
}
