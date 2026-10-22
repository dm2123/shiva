import { NextRequest, NextResponse } from 'next/server';
import { listPublicCourses } from '@/services/academic.service';
import { createApiResponse, createApiError } from '@/lib/utils';

export async function GET() {
  try {
    const courses = await listPublicCourses();
    return NextResponse.json(createApiResponse({ courses }), { status: 200 });
  } catch (error: any) {
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to list public courses.'), {
      status: 500,
    });
  }
}
