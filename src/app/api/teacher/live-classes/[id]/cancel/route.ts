import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { cancelLiveClass, getLiveClassById } from '@/services/live-class.service';
import * as db from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(request, UserRole.TEACHER);
    const profile = await db.getTeacherProfileByUserId(session.userId);
    if (!profile) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });

    const { id } = params;
    const lc = await getLiveClassById(id);
    if (!lc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (lc.teacherId !== profile.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const updated = await cancelLiveClass(id);
    return NextResponse.json({ data: updated, message: 'Live class cancelled' });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 }); 
  }
}

