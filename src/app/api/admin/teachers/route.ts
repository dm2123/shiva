import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { provisionTeacherAccount } from '@/services/user.service';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { ensureBatchScheduleSchema } from '@/lib/ensure-batch-schedule-schema';

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const body = await req.json();
    if (!body.phone) {
      return NextResponse.json({ success: false, error: { message: 'Phone number is required' } }, { status: 400 });
    }
    const result = await provisionTeacherAccount(
      body.email,
      body.password || 'Educator@123',
      body.fullName,
      body.phone,
      'shiva_org',
      body.qualification,
      body.experienceYears
    );
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    // TeacherProfiles purane DB par missing ho to SELECT 1146 par 500 deta — pehle self-heal.
    await ensureBatchScheduleSchema();
    const [rows]: any = await mysqlPool.query('SELECT id, userId, name, email, status FROM TeacherProfiles');
    return NextResponse.json({ success: true, data: { educators: rows } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
