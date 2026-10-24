import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';
import { ensureChallengeSchema } from '@/lib/ensure-challenge-schema';

/**
 * POST /api/student/friends/requests  { requestId, action: 'accept' | 'reject' }
 * Sirf wahi student jawab de sakta hai jise request aayi thi (addressee).
 */
export async function POST(req: NextRequest) {
  try {
    await ensureChallengeSchema();
    const session = await requireRole(req, UserRole.STUDENT);
    const me = session.userId;
    const body = await req.json().catch(() => ({}));
    const { requestId, action } = body || {};

    if (!requestId || (action !== 'accept' && action !== 'reject')) {
      return NextResponse.json(
        createApiError('BAD_REQUEST', "requestId aur action ('accept'/'reject') chahiye"),
        { status: 400 }
      );
    }

    const [rows]: any = await mysqlPool.query(
      `SELECT id, requesterId, addresseeId, status FROM Friendships WHERE id = ?`,
      [requestId]
    );
    const rel = rows?.[0];
    if (!rel) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Request nahi mili'), { status: 404 });
    }
    if (rel.addresseeId !== me) {
      return NextResponse.json(createApiError('FORBIDDEN', 'Ye request tumhare liye nahi hai'), { status: 403 });
    }
    if (rel.status !== 'PENDING') {
      return NextResponse.json(
        createApiError('CONFLICT', `Request pehle hi ${rel.status} hai`),
        { status: 409 }
      );
    }

    const next = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
    await mysqlPool.query(`UPDATE Friendships SET status = ? WHERE id = ?`, [next, requestId]);
    return NextResponse.json(createApiResponse({ requestId, status: next }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to respond to friend request'), { status: 500 });
  }
}
