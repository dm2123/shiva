import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { createLecture, listLecturesByChapter } from '@/services/academic.service';
import { normalizeLectureBody } from '@/lib/cms-normalize';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromHeaders(headers());
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized. Admin access required.' } }, { status: 403 });
    }

    const chapterId = req.nextUrl.searchParams.get('chapterId');
    if (!chapterId) {
      return NextResponse.json({ success: false, error: { message: 'chapterId query parameter is required' } }, { status: 400 });
    }

    const lectures = await listLecturesByChapter(chapterId);
    return NextResponse.json({ success: true, data: { lectures } }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    console.error('Admin GET /api/admin/lectures Error:', error);
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
    const lecture = await createLecture(normalizeLectureBody(body));

    return NextResponse.json({ success: true, data: { lecture } }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    console.error('Admin POST /api/admin/lectures Error:', error);
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal server error' } }, { status: 400 });
  }
}
