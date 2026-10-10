import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { amount, description } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: { message: 'Amount must be positive' } }, { status: 400 });
    }

    const [wallet]: any = await mysqlPool.query(
      'SELECT * FROM Wallet WHERE userId = ?',
      [session.userId]
    );

    if (wallet.length === 0 || wallet[0].balance < amount) {
      return NextResponse.json({ success: false, error: { message: 'Insufficient balance' } }, { status: 400 });
    }

    const walletId = wallet[0].id;

    const txnId = uuid();
    await mysqlPool.query(
      'INSERT INTO WalletTransactions (id, walletId, amount, type, description) VALUES (?, ?, ?, ?, ?)',
      [txnId, walletId, amount, 'DEBIT', description || 'Purchase']
    );

    await mysqlPool.query(
      'UPDATE Wallet SET balance = balance - ? WHERE id = ?',
      [amount, walletId]
    );

    return NextResponse.json({ success: true, data: { txnId, amount, newBalance: wallet[0].balance - amount } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
