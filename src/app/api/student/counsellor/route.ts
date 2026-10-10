import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const [rows]: any = await mysqlPool.query(
      `SELECT cc.*, 
        (SELECT content FROM CounsellorMessages cm WHERE cm.chatId = cc.id ORDER BY cm.createdAt DESC LIMIT 1) as lastMessage,
        (SELECT COUNT(*) FROM CounsellorMessages cm WHERE cm.chatId = cc.id AND cm.senderRole = 'COUNSELLOR') as unreadCount
       FROM CounsellorChats cc
       WHERE cc.studentId = ?
       ORDER BY cc.createdAt DESC`,
      [session.userId]
    );

    return NextResponse.json(createApiResponse({ chats: rows }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch chats'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const id = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await mysqlPool.query(
      `INSERT INTO CounsellorChats (id, studentId, status) VALUES (?, ?, 'OPEN')`,
      [id, session.userId]
    );

    const welcomeId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await mysqlPool.query(
      `INSERT INTO CounsellorMessages (id, chatId, senderRole, senderId, content) VALUES (?, ?, 'BOT', ?, 'Hello! I am your virtual counsellor. How can I help you today?')`,
      [welcomeId, id, session.userId]
    );

    return NextResponse.json(createApiResponse({ chatId: id }), { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to create chat'), { status: 500 });
  }
}
