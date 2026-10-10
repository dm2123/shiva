import { describe, it, expect, beforeEach } from 'vitest';
import { resetDatabase } from '@/lib/db';
import { clearAllSessions } from '@/lib/redis';
import { provisionTeacherAccount } from '@/services/user.service';
import { createCourse, enrollStudentInCourse } from '@/services/academic.service';
import { registerStudentService } from '@/services/auth.service';
import {
  createLiveClass,
  updateLiveClass,
  startLiveClass,
  endLiveClass,
  cancelLiveClass,
  getLiveClassById,
  listAdminLiveClasses,
  listTeacherLiveClasses,
  listStudentLiveClasses
} from '@/services/live-class.service';

describe('Phase 4 Integration Tests: Live Class Foundation', () => {
  beforeEach(async () => {
    await resetDatabase();
    await clearAllSessions();
  });

  it('manages live class lifecycle (Create -> Update -> Start -> End)', async () => {
    // 1. Create Teacher
    const teacher = await provisionTeacherAccount(
      'live.teacher@test.com',
      'LivePassword123',
      'Live Teacher',
      '+919999999999',
      'org-dsa-001'
    );

    const now = Date.now();
    
    // 2. Create Live Class
    const liveClass = await createLiveClass({
      title: 'Physics Live 1',
      description: 'Intro',
      scheduledStartAt: new Date(now + 3600000).toISOString(),
      scheduledEndAt: new Date(now + 7200000).toISOString(),
      teacherId: teacher.id,
      courseId: 'dummy-course-id', // Assuming nullable or no foreign key check for now
      batchId: undefined,
      subjectId: undefined,
      chapterId: undefined,
      classType: 'REGULAR',
      accessType: 'PUBLIC',
      status: 'SCHEDULED',
    });

    expect(liveClass.id).toBeDefined();
    expect(liveClass.status).toBe('SCHEDULED');

    // 3. Update Live Class
    const updated = await updateLiveClass(liveClass.id, { title: 'Physics Live Revised' });
    expect(updated.title).toBe('Physics Live Revised');

    // 4. Get by ID
    const fetched = await getLiveClassById(liveClass.id);
    expect(fetched?.title).toBe('Physics Live Revised');

    // 5. Start Live Class
    const started = await startLiveClass(liveClass.id);
    expect(started.status).toBe('LIVE');
    expect(started.actualStartedAt).toBeDefined();

    // 6. End Live Class
    const ended = await endLiveClass(liveClass.id);
    expect(ended.status).toBe('ENDED');
    expect(ended.actualEndedAt).toBeDefined();
  });

  it('correctly filters student views for live classes (Enrolled vs Public)', async () => {
    const student = await registerStudentService({
      fullName: 'Student Live',
      email: 'student.live@test.com',
      password: 'PassWord123',
      confirmPassword: 'PassWord123'
    });

    const course = await createCourse({
      title: 'Math Foundations',
      slug: 'math-foundations',
      description: 'Test description for math foundations course',
      price: 100,
      status: 'PUBLISHED',
      isPublished: true
    });

    const teacher = await provisionTeacherAccount(
      'teach.live2@test.com',
      'LivePassword123',
      'T T',
      '+919999999777',
      'org-dsa-002'
    );

    // Enrolled Class (Requires enrollment)
    await createLiveClass({
      title: 'Enrolled Math Class',
      description: 'Desc',
      scheduledStartAt: new Date().toISOString(),
      scheduledEndAt: new Date().toISOString(),
      teacherId: teacher.id,
      courseId: course.id,
      batchId: undefined,
      subjectId: undefined,
      chapterId: undefined,
      classType: 'REGULAR',
      accessType: 'ENROLLED',
      status: 'SCHEDULED',
    });

    // Public Class
    await createLiveClass({
      title: 'Public Demo Class',
      description: 'Desc',
      scheduledStartAt: new Date().toISOString(),
      scheduledEndAt: new Date().toISOString(),
      teacherId: teacher.id,
      courseId: 'any-course-123',
      batchId: undefined,
      subjectId: undefined,
      chapterId: undefined,
      classType: 'DEMO', // DEMO is treated as public by service logic
      accessType: 'PUBLIC',
      status: 'SCHEDULED',
    });

    // Expecting 1 because student is NOT enrolled - wait, the other tests might have leaked data? No, it's a beforeEach resetDatabase. Oh, actually, the first live class created in the FIRST IT block might be polluting the DB if resetDatabase doesn't fully clear live classes? Wait, let me check. Actually, in this same describe block, I create one Enrolled class and one Public Demo Class. Let's console log the returned classes.
    let studentClasses = await listStudentLiveClasses(student.user.id);
    expect(studentClasses.filter(c => c.title === 'Public Demo Class').length).toBe(1);
    expect(studentClasses.filter(c => c.title === 'Enrolled Math Class').length).toBe(0);

    // Now enroll student
    await enrollStudentInCourse(student.user.id, course.id);

    studentClasses = await listStudentLiveClasses(student.user.id);
    expect(studentClasses.filter(c => c.title === 'Enrolled Math Class').length).toBe(1);
  });

  it('can cancel a scheduled class', async () => {
    const teacher = await provisionTeacherAccount(
      'cancel.teacher@test.com',
      'LivePassword123',
      'Live Teacher',
      '+919999999998',
      'org-dsa-003'
    );
    
    const liveClass = await createLiveClass({
      title: 'To Be Cancelled',
      description: 'Intro',
      scheduledStartAt: new Date().toISOString(),
      scheduledEndAt: new Date().toISOString(),
      teacherId: teacher.id,
      courseId: 'dummy-course-id',
      batchId: undefined,
      subjectId: undefined,
      chapterId: undefined,
      classType: 'REGULAR',
      accessType: 'PUBLIC',
      status: 'SCHEDULED',
    });
    
    const cancelled = await cancelLiveClass(liveClass.id);
    expect(cancelled.status).toBe('CANCELLED');
    
    // Admin list shows it, but student list should filter out cancelled classes
    const adminList = await listAdminLiveClasses();
    expect(adminList.find(c => c.id === cancelled.id)).toBeDefined();
    
    const studentList = await listStudentLiveClasses('some-student-id');
    expect(studentList.find(c => c.id === cancelled.id)).toBeUndefined();
  });
});
