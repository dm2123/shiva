import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool, findUserByEmail, findUserById } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';
import { ensureChallengeSchema } from '@/lib/ensure-challenge-schema';
import { fetchDisplayMap } from '@/lib/challenge-utils';
import { randomUUID } from 'crypto';

/**
 * GET /api/student/friends
 * Teen lists: friends (ACCEPTED), incomingRequests (mujhe aayi PENDING),
 * outgoingRequests (maine bheji PENDING). Khaali = honest empty arrays.
 */
export async function GET(req: NextRequest) {
  try {
    await ensureChallengeSchema();
    const session = await requireRole(req, UserRole.STUDENT);
    const me = session.userId;

    const [rows]: any = await mysqlPool.query(
      `SELECT id, requesterId, addresseeId, status, createdAt FROM Friendships
        WHERE (requesterId = ? OR addresseeId = ?) AND status IN ('PENDING','ACCEPTED')
        ORDER BY createdAt DESC`,
      [me, me]
    );

    const otherIds: string[] = [];
    for (const r of rows || []) {
      otherIds.push(r.requesterId === me ? r.addresseeId : r.requesterId);
    }
    const names = await fetchDisplayMap(otherIds);

    const friends: any[] = [];
    const incomingRequests: any[] = [];
    const outgoingRequests: any[] = [];
    for (const r of rows || []) {
      const otherId = r.requesterId === me ? r.addresseeId : r.requesterId;
      const info = names[otherId] || { userId: otherId, name: null, email: '' };
      const entry = {
        requestId: r.id,
        userId: info.userId,
        name: info.name,
        email: info.email,
        since: r.createdAt ?? null,
      };
      if (r.status === 'ACCEPTED') friends.push(entry);
      else if (r.addresseeId === me) incomingRequests.push({ ...entry, requestedAt: r.createdAt ?? null });
      else outgoingRequests.push({ ...entry, requestedAt: r.createdAt ?? null });
    }

    return NextResponse.json(
      createApiResponse({ friends, incomingRequests, outgoingRequests }),
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch friends'), { status: 500 });
  }
}

/**
 * POST /api/student/friends  { email?: string, userId?: string }
 * Dost ko request bhejo. Sirf STUDENT role wale active user ko.
 */
export async function POST(req: NextRequest) {
  try {
    await ensureChallengeSchema();
    const session = await requireRole(req, UserRole.STUDENT);
    const me = session.userId;
    const body = await req.json().catch(() => ({}));
    const { email, userId } = body || {};

    if (!email && !userId) {
      return NextResponse.json(createApiError('BAD_REQUEST', 'email ya userId do'), { status: 400 });
    }

    const target = email ? await findUserByEmail(String(email).trim()) : await findUserById(String(userId));
    if (!target || target.role !== UserRole.STUDENT || target.status !== 'ACTIVE') {
      return NextResponse.json(createApiError('NOT_FOUND', 'Aisa koi student nahi mila'), { status: 404 });
    }
    if (target.id === me) {
      return NextResponse.json(createApiError('BAD_REQUEST', 'Khud ko request nahi bhej sakte'), { status: 400 });
    }

    const [existing]: any = await mysqlPool.query(
      `SELECT id, status, requesterId FROM Friendships
        WHERE (requesterId = ? AND addresseeId = ?) OR (requesterId = ? AND addresseeId = ?)`,
      [me, target.id, target.id, me]
    );

    if (existing.length > 0) {
      const rel = existing[0];
      if (rel.status === 'ACCEPTED') {
        return NextResponse.json(createApiError('CONFLICT', 'Pehle se dost hain'), { status: 409 });
      }
      if (rel.status === 'PENDING') {
        return NextResponse.json(createApiError('CONFLICT', 'Request pehle se pending hai'), { status: 409 });
      }
      // REJECTED thi — nayi request ke roop me wapas PENDING
      await mysqlPool.query(
        `UPDATE Friendships SET status = 'PENDING', requesterId = ?, addresseeId = ?, createdAt = NOW() WHERE id = ?`,
        [me, target.id, rel.id]
      );
      return NextResponse.json(
        createApiResponse({ requestId: rel.id, status: 'PENDING' }),
        { status: 200 }
      );
    }

    const id = randomUUID();
    await mysqlPool.query(
      `INSERT INTO Friendships (id, requesterId, addresseeId, status) VALUES (?, ?, ?, 'PENDING')`,
      [id, me, target.id]
    );
    return NextResponse.json(createApiResponse({ requestId: id, status: 'PENDING' }), { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to send friend request'), { status: 500 });
  }
}

/**
 * DELETE /api/student/friends?friendId=xxx
 * Dosti todo (dono taraf ki ACCEPTED row delete).
 */
export async function DELETE(req: NextRequest) {
  try {
    await ensureChallengeSchema();
    const session = await requireRole(req, UserRole.STUDENT);
    const me = session.userId;
    const friendId = new URL(req.url).searchParams.get('friendId');
    if (!friendId) {
      return NextResponse.json(createApiError('BAD_REQUEST', 'friendId chahiye'), { status: 400 });
    }
    const [res]: any = await mysqlPool.query(
      `DELETE FROM Friendships WHERE status = 'ACCEPTED'
         AND ((requesterId = ? AND addresseeId = ?) OR (requesterId = ? AND addresseeId = ?))`,
      [me, friendId, friendId, me]
    );
    return NextResponse.json(createApiResponse({ removed: res?.affectedRows || 0 }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to remove friend'), { status: 500 });
  }
}
