import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json({ success: false, error: { message: 'Plan required' } }, { status: 400 });
    }

    // Check plan
    const [plans]: any = await mysqlPool.query(
      'SELECT * FROM SubscriptionPlans WHERE id = ? AND isActive = 1',
      [planId]
    );

    if (plans.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Plan not found' } }, { status: 404 });
    }

    const plan = plans[0];

    // Check active subscription
    const [existing]: any = await mysqlPool.query(
      `SELECT id FROM Subscriptions
       WHERE studentId = ? AND status = 'ACTIVE' AND endDate > NOW()`,
      [session.userId]
    );

    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: { message: 'Already have active subscription' } }, { status: 400 });
    }

    // Create subscription
    const id = uuid();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    await mysqlPool.query(
      `INSERT INTO Subscriptions (id, studentId, planId, startDate, endDate, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, session.userId, planId, startDate, endDate, 'ACTIVE']
    );

    // Deduct from wallet if sufficient
    let [wallet]: any = await mysqlPool.query('SELECT * FROM Wallet WHERE userId = ?', [session.userId]);
    if (wallet.length > 0 && wallet[0].balance >= plan.price) {
      await mysqlPool.query(
        'INSERT INTO WalletTransactions (id, walletId, amount, type, description) VALUES (?, ?, ?, ?, ?)',
        [uuid(), wallet[0].id, plan.price, 'DEBIT', `Subscription: ${plan.name}`]
      );
      await mysqlPool.query('UPDATE Wallet SET balance = balance - ? WHERE id = ?', [plan.price, wallet[0].id]);
    }

    return NextResponse.json({ success: true, data: { id, endDate } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
