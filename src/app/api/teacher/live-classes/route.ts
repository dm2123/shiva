import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { listTeacherLiveClasses, createLiveClass } from '@/services/live-class.service';
import { ensureLiveClassSchema } from '@/lib/ensure-live-class-schema';
import { z } from 'zod';
import * as db from '@/lib/db';

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  courseId: z.string().min(1),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  batchId: z.string().optional(),
  scheduledStartAt: z.string().datetime(),
  scheduledEndAt: z.string().datetime(),
  classType: z.enum(['REGULAR', 'DEMO', 'REVISION', 'DPP', 'DOUBT_SESSION', 'SPECIAL']),
  accessType: z.enum(['PUBLIC', 'ENROLLED', 'BATCH_ONLY']),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.TEACHER);
    
    // We need teacher profile for organization etc. Usually teacher.id is mapped or we find profile by userId
    const profile = await db.getTeacherProfileByUserId(session.userId);
    if (!profile) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    
    const classes = await listTeacherLiveClasses(session.userId);
    return NextResponse.json({ data: classes });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.TEACHER);

    const profile = await db.getTeacherProfileByUserId(session.userId);
    if (!profile) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });

    const body = await request.json();
    const result = createSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { data } = result;

    if (new Date(data.scheduledEndAt) <= new Date(data.scheduledStartAt)) {
      return NextResponse.json({ error: 'scheduledEndAt must be after scheduledStartAt' }, { status: 400 });
    }

    // LiveClasses table purane DB par missing ho to createLiveClassDb
    // throw karke 500 deta — pehle self-heal.
    await ensureLiveClassSchema();
    const lc = await createLiveClass({
      ...data,
      teacherId: session.userId,
      organizationId: profile.organizationId,
      status: 'SCHEDULED' // Fixed TS error
    });

    return NextResponse.json({ data: lc, message: 'Live class created successfully' });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
