import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { createApiResponse } from '@/lib/utils';

/**
 * POST /api/demo — Free demo class booking from the marketing homepage.
 * Migration-free: stores the lead in AuditLogs (same pattern as /api/public/contact).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
    const exam = typeof body?.exam === 'string' ? body.exam.trim() : '';

    if (!name || !phone || !exam) {
      return NextResponse.json(createApiResponse({ success: false, error: 'Name, phone and exam are required.' }), { status: 400 });
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      return NextResponse.json(createApiResponse({ success: false, error: 'Please provide a valid 10-digit mobile number.' }), { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null;
    const userAgent = req.headers.get('user-agent') || null;
    const created = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await mysqlPool.query(
      `INSERT INTO AuditLogs (action, entity, details, ipAddress, userAgent, createdAt)
       VALUES ('DEMO_REQUEST', 'DemoLead', ?, ?, ?, ?)`,
      [JSON.stringify({ name, phone, exam }), ipAddress, userAgent, created]
    );

    return NextResponse.json(
      createApiResponse({ success: true, message: 'Demo request received. Our team will call you soon.' }),
      { status: 201 }
    );
  } catch {
    return NextResponse.json(createApiResponse({ success: false, error: 'Failed to book demo. Please try again.' }), { status: 500 });
  }
}
