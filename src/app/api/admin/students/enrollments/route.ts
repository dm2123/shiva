import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { enrollStudentInCourse } from '@/services/academic.service';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromHeaders(headers());
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized. Admin access required.' } }, { status: 403 });
    }

    const { studentId, courseId, batchId } = await req.json();
    
    if (!studentId || !courseId) {
       return NextResponse.json({ success: false, error: { message: 'Student ID and Course ID are required.' } }, { status: 400 });
    }
    
    const enrollment = await enrollStudentInCourse(studentId, courseId, batchId);

    return NextResponse.json({ success: true, data: { enrollment } }, { status: 201 });
  } catch (error: any) {
    console.error('Admin POST /api/admin/students/enrollments Error:', error);
    
    if (error.message && error.message.includes('DUPLICATE')) {
       return NextResponse.json({ success: false, error: { message: error.message } }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal server error' } }, { status: 400 });
  }
}
