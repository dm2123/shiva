'use client';

import { useParams } from 'next/navigation';
import CheckoutPage from '@/components/payment/CheckoutPage';

export default function Checkout() {
  const params = useParams();
  const courseId = params.courseId as string;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <CheckoutPage courseId={courseId} />
    </div>
  );
}
