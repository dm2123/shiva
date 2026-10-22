import { NextRequest, NextResponse } from 'next/server';
import { savePaymentConfig, getPaymentConfig } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const config = await req.json();
    await savePaymentConfig(config);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const config = await getPaymentConfig();
    // Mask sensitive data
    if (config && config.bankAccountNumber) {
      config.bankAccountNumber = '******' + config.bankAccountNumber.slice(-4);
    }
    return NextResponse.json({ success: true, data: config || {} });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
