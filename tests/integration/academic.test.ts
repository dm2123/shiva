import { describe, it, expect, beforeEach } from 'vitest';
import { resetDatabase } from '@/lib/db';
import { clearAllSessions } from '@/lib/redis';
import { registerStudentService, loginService } from '@/services/auth.service';
import { provisionTeacherAccount, provisionAdminAccount } from '@/services/user.service';
import {
  createCourse,
  getCourseById,
  getCourseBySlug,
  updateCourse,
  deleteCourse,
  listPublicCourses,
  listAllCourses,
  createSubject,
  listSubjectsByCourse,
  createChapter,
  listChaptersBySubject,
  createLecture,
  listLecturesByChapter,
  createBatch,
  listBatchesByCourse,
  assignTeacherToCourse,
  verifyTeacherCourseAuthorization,
  enrollStudentInCourse,
  verifyStudentCourseAuthorization,
  getCourseSyllabusTree,
} from '@/services/academic.service';
import { UserRole } from '@/types/auth';

describe('Phase 3 Integration Tests: Academic Data System & Security', () => {
  let studentUserId: string;
  let teacherUserId: string;
  let adminUserId: string;

  beforeEach(async () => {
    await resetDatabase();
    await clearAllSessions();

    const student = await registerStudentService({
      fullName: 'Academic Student',
      email: 'student.acad@shiva.local',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    studentUserId = student.user.id;

    const teacher = await provisionTeacherAccount(
      'teacher.acad@shiva.local',
      'TeacherPass123!',
      'Dr. Teacher',
      '+919999999999',
      'org-dsa-001'
    );
    teacherUserId = teacher.id;

    const admin = await provisionAdminAccount('admin.acad@shiva.local', 'AdminPass123!', 'Admin User', 'IT');
    adminUserId = admin.id;
  });

  it('performs full Course CRUD operations with slug validation', async () => {
    const course = await createCourse({
      title: 'JEE Advanced Physics 2026',
      slug: 'jee-physics-2026',
      description: 'Comprehensive physics curriculum for competitive aspirants.',
      price: 4999,
      status: 'PUBLISHED',
      isPublished: true,
    });

    expect(course.id).toBeDefined();
    expect(course.title).toBe('JEE Advanced Physics 2026');

    // Duplicate slug check
    await expect(
      createCourse({
        title: 'Another Physics',
        slug: 'jee-physics-2026',
        description: 'Duplicate slug test.',
        price: 1000,
        status: 'DRAFT',
        isPublished: false,
      })
    ).rejects.toThrow('DUPLICATE_SLUG');

    // Fetch by ID & Slug
    const fetched = await getCourseById(course.id);
    expect(fetched.slug).toBe('jee-physics-2026');

    const fetchedSlug = await getCourseBySlug('jee-physics-2026');
    expect(fetchedSlug.id).toBe(course.id);

    // Update
    const updated = await updateCourse(course.id, { price: 5999 });
    expect(Number(updated.price)).toBe(5999);

    // Delete
    const deleted = await deleteCourse(course.id);
    expect(deleted).toBe(true);
    await expect(getCourseById(course.id)).rejects.toThrow('NOT_FOUND');
  });

  it('builds full Subject -> Chapter -> Lecture hierarchy', async () => {
    const course = await createCourse({
      title: 'NEET UG Biology Masterclass',
      slug: 'neet-bio-2026',
      description: 'Complete NCERT Biology curriculum.',
      price: 2999,
      status: 'PUBLISHED',
      isPublished: true,
    });

    const subject = await createSubject({
      courseId: course.id,
      name: 'Botany',
      code: 'BOT101',
      description: 'Plant anatomy & physiology',
      sortOrder: 1,
    });
    expect(subject.id).toBeDefined();

    const chapter = await createChapter({
      subjectId: subject.id,
      title: 'Chapter 1: Cell Biology',
      description: 'Cell structure and organelles',
      sortOrder: 1,
    });
    expect(chapter.id).toBeDefined();

    const lecture = await createLecture({
      chapterId: chapter.id,
      title: 'Lecture 1: Mitochondria & Energy Cycles',
      description: 'ATP synthesis and matrix functions',
      durationSeconds: 3600,
      isPreviewable: true,
      sortOrder: 1,
    });
    expect(lecture.id).toBeDefined();

    // Verify Hierarchy Tree
    const tree = await getCourseSyllabusTree(course.id);
    expect(tree.subjects).toHaveLength(1);
    expect(tree.subjects[0].name).toBe('Botany');
    expect(tree.subjects[0].chapters).toHaveLength(1);
    expect(tree.subjects[0].chapters[0].title).toBe('Chapter 1: Cell Biology');
    expect(tree.subjects[0].chapters[0].lectures).toHaveLength(1);
    expect(tree.subjects[0].chapters[0].lectures[0].title).toBe('Lecture 1: Mitochondria & Energy Cycles');
  });

  it('enforces Teacher Course Assignment & Object-Level Security', async () => {
    const course = await createCourse({
      title: 'Authorized Course',
      slug: 'auth-course',
      description: 'Test authorization rules.',
      price: 1000,
      status: 'PUBLISHED',
      isPublished: true,
    });

    // Unassigned teacher attempt -> SHOULD FAIL
    await expect(verifyTeacherCourseAuthorization(teacherUserId, course.id)).rejects.toThrow(
      'FORBIDDEN_OBJECT_ACCESS'
    );

    // Assign Teacher
    await assignTeacherToCourse(teacherUserId, course.id);

    // Assigned teacher attempt -> SHOULD PASS
    await expect(verifyTeacherCourseAuthorization(teacherUserId, course.id)).resolves.not.toThrow();
  });

  it('enforces Student Enrollment & Object-Level Security', async () => {
    const course = await createCourse({
      title: 'Enrolled Course',
      slug: 'enrolled-course',
      description: 'Test student enrollment access.',
      price: 1000,
      status: 'PUBLISHED',
      isPublished: true,
    });

    // Unenrolled student attempt -> SHOULD FAIL
    await expect(verifyStudentCourseAuthorization(studentUserId, course.id)).rejects.toThrow(
      'FORBIDDEN_OBJECT_ACCESS'
    );

    // Enroll Student
    await enrollStudentInCourse(studentUserId, course.id);

    // Enrolled student attempt -> SHOULD PASS
    await expect(verifyStudentCourseAuthorization(studentUserId, course.id)).resolves.not.toThrow();
  });
});
