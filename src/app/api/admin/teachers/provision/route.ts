import { NextRequest, NextResponse } from 'next/server';
import { provisionTeacherAccount } from '@/services/user.service';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const body = await req.json();
    if (!body.phone) {
      return NextResponse.json({ success: false, error: { message: 'Phone number is required' } }, { status: 400 });
    }
    const result = await provisionTeacherAccount(
      body.email,
      body.password,
      body.fullName,
      body.phone,
      body.organizationId,
      body.qualification,
      body.experienceYears
    );
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 400 }
    );
  }
}
