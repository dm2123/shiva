import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { courseId, amount, method, emiMonths } = body;

    if (!courseId || !amount || !method) {
      return NextResponse.json({ success: false, error: { message: 'Course, amount, and method required' } }, { status: 400 });
    }

    // Get course
    const [courses]: any = await mysqlPool.query('SELECT * FROM Courses WHERE id = ?', [courseId]);
    if (courses.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Course not found' } }, { status: 404 });
    }

    // Check if already purchased
    const [existing]: any = await mysqlPool.query(
      'SELECT id FROM Orders WHERE studentId = ? AND courseId = ? AND status = ?',
      [session.userId, courseId, 'COMPLETED']
    );
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: { message: 'Already purchased' } }, { status: 400 });
    }

    const orderId = `ORD_${Date.now()}_${uuid().slice(0, 8)}`;
    const id = uuid();

    let emiAmount = null;
    if (emiMonths && emiMonths > 1) {
      emiAmount = amount / emiMonths;
    }

    await mysqlPool.query(
      `INSERT INTO Payments (id, orderId, studentId, courseId, amount, method, status, emiMonths, emiAmount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, orderId, session.userId, courseId, amount, method, 'PENDING', emiMonths || null, emiAmount]
    );

    // Mock Razorpay order
    const razorpayOrderId = `rzp_order_${uuid().replace(/-/g, '').slice(0, 14)}`;

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        razorpayOrderId,
        amount,
        currency: 'INR',
        method,
        emiMonths: emiMonths || null,
        emiAmount
      }
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
