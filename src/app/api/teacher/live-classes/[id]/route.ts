import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { updateLiveClass, getLiveClassById } from '@/services/live-class.service';
import { z } from 'zod';
import * as db from '@/lib/db';

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  courseId: z.string().min(1).optional(),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  batchId: z.string().optional(),
  scheduledStartAt: z.string().datetime().optional(),
  scheduledEndAt: z.string().datetime().optional(),
  classType: z.enum(['REGULAR', 'DEMO', 'REVISION', 'DPP', 'DOUBT_SESSION', 'SPECIAL']).optional(),
  accessType: z.enum(['PUBLIC', 'ENROLLED', 'BATCH_ONLY']).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(request, UserRole.TEACHER);
    const profile = await db.getTeacherProfileByUserId(session.userId);
    if (!profile) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });

    const { id } = params;
    const lc = await getLiveClassById(id);
    if (!lc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (lc.teacherId !== profile.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const result = updateSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    const updated = await updateLiveClass(id, result.data);
    return NextResponse.json({ data: updated, message: 'Updated successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
