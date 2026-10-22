import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { createChapter, listChaptersBySubject } from '@/services/academic.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromHeaders(headers());
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized. Admin access required.' } }, { status: 403 });
    }

    const subjectId = req.nextUrl.searchParams.get('subjectId');
    if (!subjectId) {
      return NextResponse.json({ success: false, error: { message: 'subjectId query parameter is required' } }, { status: 400 });
    }

    const chapters = await listChaptersBySubject(subjectId);
    return NextResponse.json({ success: true, data: { chapters } }, { status: 200 });
  } catch (error: any) {
    console.error('Admin GET /api/admin/chapters Error:', error);
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal server error' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromHeaders(headers());
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized. Admin access required.' } }, { status: 403 });
    }

    const body = await req.json();
    const chapter = await createChapter(body);

    return NextResponse.json({ success: true, data: { chapter } }, { status: 201 });
  } catch (error: any) {
    console.error('Admin POST /api/admin/chapters Error:', error);
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal server error' } }, { status: 400 });
  }
}
