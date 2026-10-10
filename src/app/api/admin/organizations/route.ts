import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationById, listOrganizations } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const organizations = await listOrganizations();
    return NextResponse.json({ success: true, data: organizations });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
