import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireRole(request, UserRole.STUDENT);

  try {
    const { id } = params;
    const [rows] = await mysqlPool.query(
      'SELECT * FROM Colleges WHERE id = ?',
      [id]
    );

    const results = rows as any[];
    if (results.length === 0) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    return NextResponse.json({ college: results[0] });
  } catch (error) {
    console.error('Error fetching college:', error);
    return NextResponse.json({ error: 'Failed to fetch college' }, { status: 500 });
  }
}
