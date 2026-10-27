import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTeacherAssignmentsDb, findCourseByIdDb, listSubjectsByCourseDb, listChaptersBySubjectDb, listLecturesByChapterDb } from '@/lib/db';
import { ensureTeacherAssignmentSchema } from '@/lib/ensure-teacher-assignment-schema';
import TeacherLecturesClient from './page.client';

export const metadata = {
  title: 'Lectures | The Shiva',
};

export default async function TeacherLectures({ searchParams }: { searchParams: { courseId?: string } }) {
  const session = await getSessionFromHeaders(headers());

  if (!session || session.role !== 'TEACHER') {
    redirect('/teacher/login');
  }

  // getTeacherAssignmentsDb TeacherCourseAssignments poochta hai -
  // purane DB par table missing ho to helper error swallow karke []
  // deta hai (page khaali dikhta). Page-level leg: helper me wiring
  // nahi (db <-> ensure circular import hota).
  await ensureTeacherAssignmentSchema();
  const assignments = await getTeacherAssignmentsDb(session.userId);
  const courses: any[] = [];
  const lectures: any[] = [];
  const chapters: any[] = [];

  for (const a of assignments) {
    const course = await findCourseByIdDb(a.courseId);
    if (!course) continue;
    courses.push({ id: course.id, title: course.title });

    const subjects = await listSubjectsByCourseDb(course.id);
    for (const subject of subjects) {
      const subjectChapters = await listChaptersBySubjectDb(subject.id);
      for (const chapter of subjectChapters) {
        chapters.push({
          id: chapter.id,
          title: chapter.title,
          subjectId: subject.id,
          subjectTitle: subject.name,
          courseId: course.id,
          courseTitle: course.title,
        });
        const chapterLectures = await listLecturesByChapterDb(chapter.id);
        for (const lecture of chapterLectures) {
          lectures.push({
            id: lecture.id,
            title: lecture.title,
            description: lecture.description,
            videoUrl: lecture.videoUrl,
            courseId: course.id,
            courseTitle: course.title,
            subjectTitle: subject.name,
            chapterTitle: chapter.title,
            chapterId: chapter.id,
            durationSeconds: Number(lecture.durationSeconds || 0),
            isPreviewable: !!lecture.isPreviewable,
            sortOrder: Number(lecture.sortOrder || 0),
          });
        }
      }
    }
  }

  const filtered = searchParams.courseId
    ? lectures.filter(l => l.courseId === searchParams.courseId)
    : lectures;

  return <TeacherLecturesClient courses={courses} chapters={chapters} initialLectures={filtered} />;
}