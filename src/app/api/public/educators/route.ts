import { NextResponse } from 'next/server';
import { listEducators, listActiveEducators, searchEducators } from '@/services/educator.service';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * GET /api/public/educators
 * Public API: List all active educators or search
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    let educators;
    if (query) {
      educators = await searchEducators(query);
      // Filter only active
      educators = educators.filter((e) => e.status === 'ACTIVE');
    } else {
      educators = await listActiveEducators();
    }

    return NextResponse.json({
      success: true,
      data: educators,
      count: educators.length,
    });
  } catch (error) {
    console.error('Error fetching educators:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch educators' },
      { status: 500 }
    );
  }
}
