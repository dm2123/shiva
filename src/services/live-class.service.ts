import * as db from '@/lib/db';
import { LiveClass, StudentEnrollment } from '@/types/models';

export async function createLiveClass(data: Omit<LiveClass, 'id' | 'createdAt' | 'updatedAt' | 'actualStartedAt' | 'actualEndedAt'>): Promise<LiveClass> {
  const id = `live-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const liveClass: Omit<LiveClass, 'createdAt' | 'updatedAt'> = {
    ...data,
    id,
    status: 'SCHEDULED', // Always starts as scheduled usually
    actualStartedAt: null,
    actualEndedAt: null,
  };
  return db.createLiveClassDb(liveClass);
}

export async function updateLiveClass(id: string, updates: Partial<Pick<LiveClass, 'title' | 'description' | 'scheduledStartAt' | 'scheduledEndAt' | 'subjectId' | 'chapterId' | 'classType' | 'accessType' | 'courseId' | 'batchId'>>): Promise<LiveClass> {
  const existing = await db.findLiveClassByIdDb(id);
  if (!existing) {
    throw new Error('Live class not found');
  }
  
  if (existing.status !== 'SCHEDULED') {
    throw new Error('Cannot update a class that is no longer SCHEDULED');
  }

  const updated = await db.updateLiveClassDb(id, updates);
  return updated!;
}

export async function startLiveClass(id: string): Promise<LiveClass> {
  const existing = await db.findLiveClassByIdDb(id);
  if (!existing) throw new Error('Live class not found');
  if (existing.status !== 'SCHEDULED') {
    throw new Error('Invalid transition: Can only start a SCHEDULED class');
  }

  const updated = await db.updateLiveClassDb(id, {
    status: 'LIVE',
    actualStartedAt: new Date().toISOString(),
  });
  return updated!;
}

export async function endLiveClass(id: string): Promise<LiveClass> {
  const existing = await db.findLiveClassByIdDb(id);
  if (!existing) throw new Error('Live class not found');
  if (existing.status !== 'LIVE') {
    throw new Error('Invalid transition: Can only end a LIVE class');
  }

  const updated = await db.updateLiveClassDb(id, {
    status: 'ENDED',
    actualEndedAt: new Date().toISOString(),
  });
  return updated!;
}

export async function cancelLiveClass(id: string): Promise<LiveClass> {
  const existing = await db.findLiveClassByIdDb(id);
  if (!existing) throw new Error('Live class not found');
  if (existing.status !== 'SCHEDULED') {
    throw new Error('Invalid transition: Can only cancel a SCHEDULED class');
  }

  const updated = await db.updateLiveClassDb(id, {
    status: 'CANCELLED',
  });
  return updated!;
}

export async function getLiveClassById(id: string): Promise<LiveClass | null> {
  return db.findLiveClassByIdDb(id);
}

export async function listAdminLiveClasses(): Promise<LiveClass[]> {
  const classes = await db.listLiveClassesDb();
  return classes.sort((a: any, b: any) => new Date(b.scheduledStartAt).getTime() - new Date(a.scheduledStartAt).getTime());
}

export async function listTeacherLiveClasses(teacherId: string): Promise<LiveClass[]> {
  const classes = await db.listLiveClassesDb();
  return classes
    .filter((c: any) => c.teacherId === teacherId)
    .sort((a: any, b: any) => new Date(b.scheduledStartAt).getTime() - new Date(a.scheduledStartAt).getTime());
}

export async function listStudentLiveClasses(studentId: string): Promise<LiveClass[]> {
  // A student sees a live class if:
  // 1. It is PUBLIC.
  // 2. They are enrolled in the course mapped to the live class.
  const allClasses = await db.listLiveClassesDb();
  
  // Exclude CANCELLED classes if we don't want to show them? The prompt just says upcoming, live, ended.
  // Actually, we'll return them but front-end can filter out, or filter out here.
  const relevantClasses = allClasses.filter((c: any) => c.status !== 'CANCELLED');

  const studentEnrollments = await db.getStudentEnrollmentsByStudentIdDb(studentId);
  const activeCourseIds = new Set(studentEnrollments.filter((e: any) => e.status === 'ACTIVE').map((e: any) => e.courseId));
  
  return relevantClasses.filter((c: any) => {
    if (c.accessType === 'PUBLIC' || c.classType === 'DEMO') return true;
    if (c.accessType === 'ENROLLED' && activeCourseIds.has(c.courseId)) return true;
    if (c.accessType === 'BATCH_ONLY') {
      return activeCourseIds.has(c.courseId);
    }
    return false;
  }).sort((a: any, b: any) => new Date(b.scheduledStartAt).getTime() - new Date(a.scheduledStartAt).getTime());
}
