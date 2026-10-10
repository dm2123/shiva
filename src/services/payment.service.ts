import { Order } from '@/types/models';
import * as db from '@/lib/db';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export const orderSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  amount: z.number().min(0),
});

export async function createOrder(input: any): Promise<Order> {
  const v = orderSchema.parse(input);
  return db.createOrderDb({
    id: `ord-${randomUUID()}`,
    ...v,
    status: 'PENDING',
  });
}

export async function submitPayment(orderId: string, paymentId: string) {
  return db.updateOrderDb(orderId, { status: 'SUCCESS', paymentId });
}

export async function listAllOrders(): Promise<Order[]> {
  return db.listOrdersDb();
}
