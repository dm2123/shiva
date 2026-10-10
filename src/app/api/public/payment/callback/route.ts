import { NextRequest, NextResponse } from 'next/server';
import { submitPayment } from '@/services/payment.service';

export async function POST(req: NextRequest) {
  const { orderId, paymentId } = await req.json();
  
  if (!orderId || !paymentId) {
    return NextResponse.json({ success: false, error: 'Missing details' }, { status: 400 });
  }

  await submitPayment(orderId, paymentId);
  return NextResponse.json({ success: true, message: 'Payment recorded' });
}
