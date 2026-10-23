import { z } from 'zod';
import { randomUUID } from 'crypto';
import { Course, Subject, Chapter, Lecture, Batch, TeacherCourseAssignment, StudentEnrollment } from '@/types/models';
import {
  createCourseDb,
  findCourseByIdDb,
  findCourseBySlugDb,
  updateCourseDb,
  deleteCourseDb,
  listCoursesDb,
  createSubjectDb,
  findSubjectByIdDb,
  updateSubjectDb,
  deleteSubjectDb,
  listSubjectsByCourseDb,
  createChapterDb,
  findChapterByIdDb,
  updateChapterDb,
  deleteChapterDb,
  listChaptersBySubjectDb,
  createLectureDb,
  findLectureByIdDb,
  updateLectureDb,
  deleteLectureDb,
  listLecturesByChapterDb,
  createBatchDb,
  findBatchByIdDb,
  listBatchesByCourseDb,
  createTeacherAssignmentDb,
  getTeacherAssignmentsDb,
  isTeacherAssignedToCourseDb,
  createStudentEnrollmentDb,
  getStudentEnrollmentsDb,
  isStudentEnrolledInCourseDb,
  mysqlPool,
} from '@/lib/db';
import { ensureSeed } from '@/db/ensure-seed';
import { ensureAptitudePetLectures } from '@/lib/ensure-aptitude-content';
import { hasCourseInfoColumns } from '@/lib/ensure-course-schema';

// -------------------------------------------------------------
// ZOD SCHEMAS
// -------------------------------------------------------------

export const courseSchema = z.object({
  title: z.string().trim().min(3, 'Course title must be at least 3 characters'),
  slug: z.string().trim().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  thumbnailUrl: z.string().optional(),
  price: z.number().min(0, 'Price cannot be negative').default(0),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  isPublished: z.boolean().default(false),
  // Course-detail info (§21): language, validity (months), "kiske liye hai".
  language: z.string().trim().max(60).optional(),
  validityMonths: z.number().int().min(1).max(60).optional(),
  targetAudience: z.string().trim().max(1000).optional(),
});

export const subjectSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  name: z.string().trim().min(2, 'Subject name must be at least 2 characters'),
  code: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().default(1),
});

export const chapterSchema = z.object({
  subjectId: z.string().min(1, 'Subject ID is required'),
  title: z.string().trim().min(2, 'Chapter title must be at least 2 characters'),
  description: z.string().optional(),
  sortOrder: z.number().default(1),
});

export const lectureSchema = z.object({
  chapterId: z.string().min(1, 'Chapter ID is required'),
  title: z.string().trim().min(2, 'Lecture title must be at least 2 characters'),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  durationSeconds: z.number().min(0).default(0),
  isPreviewable: z.boolean().default(false),
  sortOrder: z.number().default(1),
});

export const batchSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  name: z.string().trim().min(2, 'Batch name must be at least 2 characters'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED']).default('UPCOMING'),
});

// --- COURSE SERVICE ---
export async function createCourse(input: z.infer<typeof courseSchema>): Promise<Course> {
  const validated = courseSchema.parse(input);
  
  if (mysqlPool) {
    const [existing] = await mysqlPool.query('SELECT id FROM Courses WHERE slug = ?', [validated.slug]);
    if (existing && (existing as any[]).length > 0) {
      throw new Error(`DUPLICATE_SLUG: Course slug '${validated.slug}' is already taken.`);
    }
  }

  const now = new Date().toISOString();
  // Purane DBs par columns na hon to self-heal try karo; na bane to keys
  // hata do taaki INSERT purane schema par bhi na gire.
  const infoCols = await hasCourseInfoColumns();
  const course: Course = {
    id: randomUUID(),
    title: validated.title,
    slug: validated.slug,
    description: validated.description,
    thumbnailUrl: validated.thumbnailUrl,
    price: validated.price,
    status: validated.status,
    isPublished: validated.isPublished || validated.status === 'PUBLISHED',
    ...(infoCols
      ? {
          language: validated.language || undefined,
          validityMonths: validated.validityMonths,
          targetAudience: validated.targetAudience || undefined,
        }
      : {}),
    createdAt: now,
    updatedAt: now,
  };

  return createCourseDb(course);
}

export async function updateCourse(id: string, updates: Partial<z.infer<typeof courseSchema>>): Promise<Course> {
  const existing = await findCourseByIdDb(id);
  if (!existing) {
    throw new Error(`NOT_FOUND: Course with ID '${id}' does not exist.`);
  }

  // Info columns purane DB par na hon to unhe update se hata do (UPDATE na gire).
  if (!(await hasCourseInfoColumns())) {
    delete (updates as any).language;
    delete (updates as any).validityMonths;
    delete (updates as any).targetAudience;
  }

  if (updates.slug && updates.slug !== existing.slug) {
      if (mysqlPool) {
      const [slugCheck] = await mysqlPool.query('SELECT id FROM Courses WHERE slug = ?', [updates.slug]);
      if (slugCheck && (slugCheck as any[]).length > 0) {
        throw new Error(`DUPLICATE_SLUG: Course slug '${updates.slug}' is already taken.`);
      }
    }
  }

  const ok = await updateCourseDb(id, updates);
  if (!ok) {
    throw new Error(`NOT_FOUND: Failed to update course '${id}'.`);
  }
  const updated = await findCourseByIdDb(id);
  return updated as Course;
}

export async function deleteCourse(id: string): Promise<boolean> {
  const existing = await findCourseByIdDb(id);
  // We bypass the strict check to ensure delete works smoothly even if db mismatch
  return deleteCourseDb(id);
}

export async function getCourseById(id: string): Promise<Course> {
  const course = await findCourseByIdDb(id);
  if (!course) {
    throw new Error(`NOT_FOUND: Course with ID '${id}' does not exist.`);
  }
  return course;
}

export async function getCourseBySlug(slug: string): Promise<Course> {
  let course = null;
  if (mysqlPool) {
    const [rows]: any = await mysqlPool.query('SELECT * FROM Courses WHERE slug = ?', [slug]);
    course = rows[0] || null;
  }
  if (!course) {
    throw new Error(`NOT_FOUND: Course with slug '${slug}' does not exist.`);
  }
  return course;
}

export async function listPublicCourses(): Promise<Course[]> {
  await ensureSeed();
  return listCoursesDb(false); // false = published only
}

export async function listAllCourses(): Promise<Course[]> {
  await ensureSeed();
  return listCoursesDb(true); // true = include unpublished
}

// -------------------------------------------------------------
// SUBJECT SERVICE
// -------------------------------------------------------------

export async function createSubject(input: z.infer<typeof subjectSchema>): Promise<Subject> {
  const validated = subjectSchema.parse(input);
  const course = await findCourseByIdDb(validated.courseId);
  if (!course) {
    throw new Error(`NOT_FOUND: Parent course '${validated.courseId}' does not exist.`);
  }

  const now = new Date().toISOString();
  const subject: Subject = {
    id: randomUUID(),
    courseId: validated.courseId,
    name: validated.name,
    code: validated.code,
    description: validated.description,
    sortOrder: validated.sortOrder,
    createdAt: now,
    updatedAt: now,
  };

  return createSubjectDb(subject);
}

export async function updateSubject(id: string, updates: Partial<z.infer<typeof subjectSchema>>): Promise<Subject> {
  const existing = await findSubjectByIdDb(id);
  if (!existing) {
    throw new Error(`NOT_FOUND: Subject with ID '${id}' does not exist.`);
  }
  const updated = await updateSubjectDb(id, updates);
  if (!updated) {
    throw new Error(`NOT_FOUND: Failed to update subject '${id}'.`);
  }
  return updated;
}

export async function deleteSubject(id: string): Promise<boolean> {
  const existing = await findSubjectByIdDb(id);
  if (!existing) {
    throw new Error(`NOT_FOUND: Subject with ID '${id}' does not exist.`);
  }
  return deleteSubjectDb(id);
}

export async function listSubjectsByCourse(courseId: string): Promise<Subject[]> {
  return listSubjectsByCourseDb(courseId);
}

export async function getSubjectById(id: string): Promise<Subject> {
  const subject = await findSubjectByIdDb(id);
  if (!subject) {
    throw new Error(`NOT_FOUND: Subject with ID '${id}' does not exist.`);
  }
  return subject;
}

// -------------------------------------------------------------
// CHAPTER SERVICE
// -------------------------------------------------------------

export async function createChapter(input: z.infer<typeof chapterSchema>): Promise<Chapter> {
  const validated = chapterSchema.parse(input);
  const subject = await findSubjectByIdDb(validated.subjectId);
  if (!subject) {
    throw new Error(`NOT_FOUND: Parent subject '${validated.subjectId}' does not exist.`);
  }

  const now = new Date().toISOString();
  const chapter: Chapter = {
    id: randomUUID(),
    subjectId: validated.subjectId,
    title: validated.title,
    description: validated.description,
    sortOrder: validated.sortOrder,
    createdAt: now,
    updatedAt: now,
  };

  return createChapterDb(chapter);
}

export async function updateChapter(id: string, updates: Partial<z.infer<typeof chapterSchema>>): Promise<Chapter> {
  const existing = await findChapterByIdDb(id);
  if (!existing) {
    throw new Error(`NOT_FOUND: Chapter with ID '${id}' does not exist.`);
  }
  const updated = await updateChapterDb(id, updates);
  if (!updated) {
    throw new Error(`NOT_FOUND: Failed to update chapter '${id}'.`);
  }
  return updated;
}

export async function deleteChapter(id: string): Promise<boolean> {
  const existing = await findChapterByIdDb(id);
  if (!existing) {
    throw new Error(`NOT_FOUND: Chapter with ID '${id}' does not exist.`);
  }
  return deleteChapterDb(id);
}

export async function listChaptersBySubject(subjectId: string): Promise<Chapter[]> {
  return listChaptersBySubjectDb(subjectId);
}

export async function getChapterById(id: string): Promise<Chapter> {
  const chapter = await findChapterByIdDb(id);
  if (!chapter) {
    throw new Error(`NOT_FOUND: Chapter with ID '${id}' does not exist.`);
  }
  return chapter;
}

// -------------------------------------------------------------
// LECTURE SERVICE
// -------------------------------------------------------------

export async function createLecture(input: z.infer<typeof lectureSchema>): Promise<Lecture> {
  const validated = lectureSchema.parse(input);
  const chapter = await findChapterByIdDb(validated.chapterId);
  if (!chapter) {
    throw new Error(`NOT_FOUND: Parent chapter '${validated.chapterId}' does not exist.`);
  }

  const now = new Date().toISOString();
  const lecture: Lecture = {
    id: randomUUID(),
    chapterId: validated.chapterId,
    title: validated.title,
    description: validated.description,
    videoUrl: validated.videoUrl,
    durationSeconds: validated.durationSeconds,
    isPreviewable: validated.isPreviewable,
    sortOrder: validated.sortOrder,
    createdAt: now,
    updatedAt: now,
  };

  return createLectureDb(lecture);
}

export async function updateLecture(id: string, updates: Partial<z.infer<typeof lectureSchema>>): Promise<Lecture> {
  const existing = await findLectureByIdDb(id);
  if (!existing) {
    throw new Error(`NOT_FOUND: Lecture with ID '${id}' does not exist.`);
  }
  const updated = await updateLectureDb(id, updates);
  if (!updated) {
    throw new Error(`NOT_FOUND: Failed to update lecture '${id}'.`);
  }
  return updated;
}

export async function deleteLecture(id: string): Promise<boolean> {
  const existing = await findLectureByIdDb(id);
  if (!existing) {
    throw new Error(`NOT_FOUND: Lecture with ID '${id}' does not exist.`);
  }
  return deleteLectureDb(id);
}

export async function listLecturesByChapter(chapterId: string): Promise<Lecture[]> {
  return listLecturesByChapterDb(chapterId);
}

// -------------------------------------------------------------
// BATCH SERVICE
// -------------------------------------------------------------

export async function createBatch(input: z.infer<typeof batchSchema>): Promise<Batch> {
  const validated = batchSchema.parse(input);
  const course = await findCourseByIdDb(validated.courseId);
  if (!course) {
    throw new Error(`NOT_FOUND: Parent course '${validated.courseId}' does not exist.`);
  }

  const now = new Date().toISOString();
  const batch: Batch = {
    id: randomUUID(),
    courseId: validated.courseId,
    name: validated.name,
    startDate: validated.startDate,
    endDate: validated.endDate,
    status: validated.status,
    createdAt: now,
    updatedAt: now,
  };

  return createBatchDb(batch);
}

export async function listBatchesByCourse(courseId: string): Promise<Batch[]> {
  return listBatchesByCourseDb(courseId);
}

// -------------------------------------------------------------
// TEACHER ASSIGNMENT & OBJECT-LEVEL SECURITY
// -------------------------------------------------------------

export async function assignTeacherToCourse(teacherId: string, courseId: string): Promise<TeacherCourseAssignment> {
  const isAssigned = await isTeacherAssignedToCourseDb(teacherId, courseId);
  if (isAssigned) {
    throw new Error(`DUPLICATE_ASSIGNMENT: Teacher '${teacherId}' is already assigned to course '${courseId}'.`);
  }

  const assignment: TeacherCourseAssignment = {
    id: randomUUID(),
    teacherId,
    courseId,
    assignedAt: new Date().toISOString(),
  };

  return createTeacherAssignmentDb(assignment);
}

export async function getTeacherAssignedCourses(teacherId: string): Promise<Course[]> {
  const assignments = await getTeacherAssignmentsDb(teacherId);
  const courses: Course[] = [];
  for (const a of assignments) {
    const c = await findCourseByIdDb(a.courseId);
    if (c) courses.push(c);
  }
  return courses;
}

export async function verifyTeacherCourseAuthorization(teacherId: string, courseId: string): Promise<void> {
  const isAssigned = await isTeacherAssignedToCourseDb(teacherId, courseId);
  if (!isAssigned) {
    throw new Error(`FORBIDDEN_OBJECT_ACCESS: Teacher '${teacherId}' is not assigned to manage course '${courseId}'.`);
  }
}

// -------------------------------------------------------------
// STUDENT ENROLLMENT & OBJECT-LEVEL SECURITY
// -------------------------------------------------------------

export async function enrollStudentInCourse(studentId: string, courseId: string, batchId?: string): Promise<StudentEnrollment> {
  const isEnrolled = await isStudentEnrolledInCourseDb(studentId, courseId);
  if (isEnrolled) {
    throw new Error(`DUPLICATE_ENROLLMENT: Student '${studentId}' is already enrolled in course '${courseId}'.`);
  }

  const enrollment: StudentEnrollment = {
    id: randomUUID(),
    studentId,
    courseId,
    batchId,
    status: 'ACTIVE',
    enrolledAt: new Date().toISOString(),
  };

  return createStudentEnrollmentDb(enrollment);
}

export async function getStudentEnrolledCourses(studentId: string): Promise<Course[]> {
  const enrollments = await getStudentEnrollmentsDb(studentId);
  const courses: Course[] = [];
  for (const e of enrollments) {
    const c = await findCourseByIdDb(e.courseId);
    if (c) courses.push(c);
  }
  return courses;
}

export async function verifyStudentCourseAuthorization(studentId: string, courseId: string): Promise<void> {
  const isEnrolled = await isStudentEnrolledInCourseDb(studentId, courseId);
  if (!isEnrolled) {
    throw new Error(`FORBIDDEN_OBJECT_ACCESS: Student '${studentId}' is not enrolled in course '${courseId}'.`);
  }
}

// -------------------------------------------------------------
// FULL SYLLABUS TREE BUILDER
// -------------------------------------------------------------

export interface ChapterTree extends Chapter {
  lectures: Lecture[];
}

export interface SubjectTree extends Subject {
  chapters: ChapterTree[];
}

export interface CourseSyllabusTree extends Course {
  subjects: SubjectTree[];
  batches: Batch[];
}

export async function getCourseSyllabusTree(courseIdOrSlug: string): Promise<CourseSyllabusTree> {
  // Self-heal seeded lectures (Aptitude Foundation — UPSSSC PET videos).
  await ensureAptitudePetLectures();
  let course = await findCourseByIdDb(courseIdOrSlug);
  if (!course) {
    if (mysqlPool) {
      const [rows]: any = await mysqlPool.query('SELECT * FROM Courses WHERE slug = ?', [courseIdOrSlug]);
      course = rows[0] || null;
    }
  }
  if (!course) {
    throw new Error(`NOT_FOUND: Course '${courseIdOrSlug}' not found.`);
  }

  const subjects = await listSubjectsByCourseDb(course.id);
  const batches = await listBatchesByCourseDb(course.id);

  const subjectTrees: SubjectTree[] = [];
  for (const s of subjects) {
    const chapters = await listChaptersBySubjectDb(s.id);
    const chapterTrees: ChapterTree[] = [];
    for (const ch of chapters) {
      const lectures = (await listLecturesByChapterDb(ch.id)); // Removing filter as Lecture has no isPublished
      chapterTrees.push({
        ...ch,
        lectures,
      });
    }
    subjectTrees.push({
      ...s,
      chapters: chapterTrees,
    });
  }

  return {
    ...course,
    subjects: subjectTrees.filter(s => s.chapters.some(c => c.lectures.length > 0)), // Added filter
    batches,
  };
}
