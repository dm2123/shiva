import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const [wallet]: any = await mysqlPool.query(
      'SELECT * FROM Wallet WHERE userId = ?',
      [session.userId]
    );

    const [transactions]: any = await mysqlPool.query(
      'SELECT * FROM WalletTransactions WHERE walletId = ? ORDER BY createdAt DESC LIMIT 50',
      [wallet[0]?.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        balance: wallet[0]?.balance || 0,
        walletId: wallet[0]?.id,
        transactions
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
