import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, UserRole.STUDENT);

  try {
    const [rows] = await mysqlPool.query(
      'SELECT * FROM Colleges ORDER BY ranking ASC'
    );
    return NextResponse.json({ colleges: rows });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    return NextResponse.json({ error: 'Failed to fetch colleges' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, UserRole.STUDENT);

  try {
    const { exam, rank, category } = await request.json();

    if (!exam || !rank || !category) {
      return NextResponse.json({ error: 'exam, rank, and category are required' }, { status: 400 });
    }

    const [colleges] = await mysqlPool.query('SELECT * FROM Colleges') as any;
    const matching = (colleges as any[]).filter((college) => {
      if (!college.cutoffData) return false;
      const cutoffData = typeof college.cutoffData === 'string'
        ? JSON.parse(college.cutoffData)
        : college.cutoffData;

      if (!cutoffData[exam]) return false;
      const categoryCutoff = cutoffData[exam][category];
      if (!categoryCutoff) return false;

      return rank <= categoryCutoff;
    });

    matching.sort((a: any, b: any) => a.ranking - b.ranking);

    return NextResponse.json({ colleges: matching, count: matching.length });
  } catch (error) {
    console.error('Error predicting colleges:', error);
    return NextResponse.json({ error: 'Failed to predict colleges' }, { status: 500 });
  }
}
