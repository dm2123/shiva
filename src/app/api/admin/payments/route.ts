import { NextRequest, NextResponse } from 'next/server';
import { listAllOrders } from '@/services/payment.service';
import { createApiResponse } from '@/lib/utils';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const orders = await listAllOrders();
    const payments = orders.map(o => ({
      id: `pay-${o.id}`,
      orderId: o.id,
      amount: o.amount,
      status: o.status,
      method: 'GATEWAY/UPI',
      createdAt: o.createdAt
    }));
    return NextResponse.json(createApiResponse(payments));
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
