import { listCoursesDb, getStudentEnrollmentsDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { parseSessionCookie, validateServerSession } from '@/lib/auth';
import StudentCourseCard from '@/components/student/StudentCourseCard';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { StudentPageHeader } from '@/components/student/StudentShared';
import { IconBook } from '@/components/student/StudentIcons';

export const revalidate = 0;

export default async function StudentCoursesPage() {
  const cookieHeader = cookies().toString();
  const sessionId = parseSessionCookie(cookieHeader);
  const session = sessionId ? await validateServerSession(sessionId) : null;
  const allCourses = await listCoursesDb(false);
  
  let enrolledCourseIds: Set<string> = new Set();
  if (session) {
    const enrollments = await getStudentEnrollmentsDb(session.userId);
    enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
  }

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Courses"
        description="Explore our structured curriculum designed for competitive examination preparation."
      />

      {allCourses.length === 0 ? (
        <StudentEmptyState
          icon={<IconBook size={24} />}
          title="No Courses Available"
          description="There are currently no published courses in the curriculum. New courses will appear here once published by your institution."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {allCourses.map((course) => (
            <StudentCourseCard key={course.id} course={course} isEnrolled={enrolledCourseIds.has(course.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
