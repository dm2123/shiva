import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { saveLectureProgressDb } from '@/lib/db';
import { ensureLectureProgressSchema } from '@/lib/ensure-lecture-progress-schema';
import { createApiResponse, createApiError } from '@/lib/utils';
import { z } from 'zod';

const ProgressSchema = z.object({
  lectureId: z.string(),
  isCompleted: z.boolean(),
  positionSeconds: z.number().optional().default(0),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    
    const validated = ProgressSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(createApiError('BAD_REQUEST', 'Invalid input'), { status: 400 });
    }
    
    const { lectureId, isCompleted, positionSeconds } = validated.data;

    // LectureProgress table purane DB par missing ho to save 500 ke
    // bajay self-heal ke baad kaam kare.
    await ensureLectureProgressSchema();
    await saveLectureProgressDb(session.userId, lectureId, isCompleted, positionSeconds);
    return NextResponse.json(createApiResponse({ success: true }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', 'Failed to save progress.'), { status: 500 });
  }
}
