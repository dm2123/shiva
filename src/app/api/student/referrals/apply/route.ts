import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { code } = body;

    if (!code?.trim()) {
      return NextResponse.json({ success: false, error: { message: 'Referral code required' } }, { status: 400 });
    }

    // Check if user already applied a referral
    const [existing]: any = await mysqlPool.query(
      'SELECT id FROM Referrals WHERE referredUserId = ?',
      [session.userId]
    );

    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: { message: 'Already used a referral code' } }, { status: 400 });
    }

    // Find referrer
    const [referrer]: any = await mysqlPool.query(
      'SELECT id FROM Users WHERE referralCode = ?',
      [code.trim().toUpperCase()]
    );

    if (referrer.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Invalid referral code' } }, { status: 404 });
    }

    if (referrer[0].id === session.userId) {
      return NextResponse.json({ success: false, error: { message: 'Cannot use your own code' } }, { status: 400 });
    }

    // Create referral record
    const id = uuid();
    const rewardAmount = 50; // Fixed reward
    await mysqlPool.query(
      'INSERT INTO Referrals (id, referrerUserId, referredUserId, rewardAmount) VALUES (?, ?, ?, ?)',
      [id, referrer[0].id, session.userId, rewardAmount]
    );

    // Credit referrer's wallet
    let [wallet]: any = await mysqlPool.query(
      'SELECT * FROM Wallet WHERE userId = ?',
      [referrer[0].id]
    );

    if (wallet.length === 0) {
      const walletId = uuid();
      await mysqlPool.query('INSERT INTO Wallet (id, userId, balance) VALUES (?, ?, 0)', [walletId, referrer[0].id]);
      wallet = [{ id: walletId }];
    }

    await mysqlPool.query(
      'INSERT INTO WalletTransactions (id, walletId, amount, type, description) VALUES (?, ?, ?, ?, ?)',
      [uuid(), wallet[0].id, rewardAmount, 'CREDIT', `Referral reward: ${session.email}`]
    );
    await mysqlPool.query('UPDATE Wallet SET balance = balance + ? WHERE id = ?', [rewardAmount, wallet[0].id]);

    // Award XP to referrer
    await mysqlPool.query(
      'INSERT INTO StudentXP (id, studentId, points, source, description) VALUES (?, ?, ?, ?, ?)',
      [uuid(), referrer[0].id, rewardAmount, 'REFERRAL', 'Referral sign-up bonus']
    );

    return NextResponse.json({ success: true, data: { rewardAmount } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
