import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: { message: 'Amount must be positive' } }, { status: 400 });
    }

    // Get or create wallet
    let [wallet]: any = await mysqlPool.query(
      'SELECT * FROM Wallet WHERE userId = ?',
      [session.userId]
    );

    if (wallet.length === 0) {
      const walletId = uuid();
      await mysqlPool.query(
        'INSERT INTO Wallet (id, userId, balance) VALUES (?, ?, 0)',
        [walletId, session.userId]
      );
      wallet = [{ id: walletId, balance: 0 }];
    }

    const walletId = wallet[0].id;

    // Record transaction
    const txnId = uuid();
    await mysqlPool.query(
      'INSERT INTO WalletTransactions (id, walletId, amount, type, description) VALUES (?, ?, ?, ?, ?)',
      [txnId, walletId, amount, 'CREDIT', 'Wallet top-up']
    );

    // Update balance
    await mysqlPool.query(
      'UPDATE Wallet SET balance = balance + ? WHERE id = ?',
      [amount, walletId]
    );

    return NextResponse.json({ success: true, data: { txnId, amount, newBalance: wallet[0].balance + amount } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
