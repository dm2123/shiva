import { NextResponse } from 'next/server';
import { getEducatorById } from '@/services/educator.service';

/**
 * GET /api/public/educators/[id]
 * Public API: Get single educator by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const educator = await getEducatorById(params.id);

    if (!educator) {
      return NextResponse.json(
        { success: false, error: 'Educator not found' },
        { status: 404 }
      );
    }

    if (educator.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Educator not available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: educator,
    });
  } catch (error) {
    console.error('Error fetching educator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch educator' },
      { status: 500 }
    );
  }
}
