import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { createApiResponse } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const subject = typeof body?.subject === 'string' ? body.subject.trim() : '';
    const message = typeof body?.message === 'string' ? body.message.trim() : '';

    if (!name || !email || !subject || !message) {
      return NextResponse.json(createApiResponse({ success: false, error: 'All fields are required.' }), { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(createApiResponse({ success: false, error: 'Please provide a valid email address.' }), { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null;
    const userAgent = req.headers.get('user-agent') || null;
    const created = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await mysqlPool.query(
      `INSERT INTO AuditLogs (action, entity, details, ipAddress, userAgent, createdAt)
       VALUES ('CONTACT_FORM', 'ContactMessage', ?, ?, ?, ?)`,
      [JSON.stringify({ name, email, subject, message }), ipAddress, userAgent, created]
    );

    return NextResponse.json(
      createApiResponse({ success: true, message: 'Your message has been received. We will get back to you soon.' }),
      { status: 201 }
    );
  } catch {
    return NextResponse.json(createApiResponse({ success: false, error: 'Failed to send your message. Please try again.' }), { status: 500 });
  }
}