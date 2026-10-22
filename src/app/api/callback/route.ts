import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { createApiResponse } from '@/lib/utils';

/**
 * POST /api/callback — "Request a Call Back" from the marketing homepage.
 * Migration-free: stores the lead in AuditLogs (same pattern as /api/public/contact).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';

    if (!name || !phone) {
      return NextResponse.json(createApiResponse({ success: false, error: 'Name and phone are required.' }), { status: 400 });
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      return NextResponse.json(createApiResponse({ success: false, error: 'Please provide a valid 10-digit mobile number.' }), { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null;
    const userAgent = req.headers.get('user-agent') || null;
    const created = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await mysqlPool.query(
      `INSERT INTO AuditLogs (action, entity, details, ipAddress, userAgent, createdAt)
       VALUES ('CALLBACK_REQUEST', 'CallbackLead', ?, ?, ?, ?)`,
      [JSON.stringify({ name, phone }), ipAddress, userAgent, created]
    );

    return NextResponse.json(
      createApiResponse({ success: true, message: 'Callback request received. Our counsellor will call you soon.' }),
      { status: 201 }
    );
  } catch {
    return NextResponse.json(createApiResponse({ success: false, error: 'Failed to request callback. Please try again.' }), { status: 500 });
  }
}
