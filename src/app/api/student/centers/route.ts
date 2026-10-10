import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.STUDENT);
    const url = new URL(req.url);
    const city = url.searchParams.get('city');

    let query = 'SELECT * FROM OfflineCenters WHERE isActive = 1';
    const params: any[] = [];

    if (city) {
      query += ' WHERE city = ?';
      params.push(city);
    }

    query += ' ORDER BY name ASC';

    const [rows]: any = await mysqlPool.query(query, params);

    return NextResponse.json({ success: true, data: { centers: rows } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
