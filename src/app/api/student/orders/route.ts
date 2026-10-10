import { NextRequest, NextResponse } from 'next/server';
import { createOrder, listAllOrders } from '@/services/payment.service';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  const session = await getSessionFromHeaders(headers());
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const order = await createOrder({ ...body, studentId: session.userId });
  
  return NextResponse.json({ success: true, data: order }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const orders = await listAllOrders();
  return NextResponse.json({ success: true, data: orders });
}
