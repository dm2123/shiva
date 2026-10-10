import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { orderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: { message: 'Order ID required' } }, { status: 400 });
    }

    // Get payment
    const [payments]: any = await mysqlPool.query(
      'SELECT * FROM Payments WHERE orderId = ? AND studentId = ?',
      [orderId, session.userId]
    );

    if (payments.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Payment not found' } }, { status: 404 });
    }

    const payment = payments[0];

    // Verify Razorpay signature
    if (razorpayPaymentId && razorpaySignature) {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(`${orderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return NextResponse.json({ success: false, error: { message: 'Invalid payment signature' } }, { status: 400 });
      }
    } else {
      return NextResponse.json({ success: false, error: { message: 'Payment ID and signature required' } }, { status: 400 });
    }

    await mysqlPool.query(
      `UPDATE Payments SET status = 'SUCCESS', razorpayPaymentId = ?, razorpaySignature = ? WHERE id = ?`,
      [razorpayPaymentId, razorpaySignature, payment.id]
    );

    // Create order
    const orderId2 = uuid();
    await mysqlPool.query(
      'INSERT INTO Orders (id, studentId, courseId, amount, status) VALUES (?, ?, ?, ?, ?)',
      [orderId2, session.userId, payment.courseId, payment.amount, 'COMPLETED']
    );

    // Enroll student
    const enrollmentId = uuid();
    await mysqlPool.query(
      'INSERT INTO Enrollments (id, studentId, courseId, enrolledAt, status) VALUES (?, ?, ?, NOW(), ?)',
      [enrollmentId, session.userId, payment.courseId, 'ACTIVE']
    );

    // Award XP
    await mysqlPool.query(
      'INSERT INTO StudentXP (id, studentId, points, source, description) VALUES (?, ?, 50, ?, ?)',
      [uuid(), session.userId, 'DAILY_LOGIN', 'Course purchase bonus']
    );

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        status: 'SUCCESS',
        enrollmentId
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
