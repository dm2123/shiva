import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { createLecture } from '@/services/academic.service';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromHeaders(headers());
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized. Admin access required.' } }, { status: 403 });
    }

    const body = await req.json();
    const lecture = await createLecture(body);

    return NextResponse.json({ success: true, data: { lecture } }, { status: 201 });
  } catch (error: any) {
    console.error('Admin POST /api/admin/lectures Error:', error);
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal server error' } }, { status: 400 });
  }
}
