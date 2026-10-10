import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const { chatId } = params;

    const [chatRows]: any = await mysqlPool.query(
      `SELECT * FROM CounsellorChats WHERE id = ? AND studentId = ?`,
      [chatId, session.userId]
    );
    if (chatRows.length === 0) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Chat not found'), { status: 404 });
    }

    const [messages]: any = await mysqlPool.query(
      `SELECT * FROM CounsellorMessages WHERE chatId = ? ORDER BY createdAt ASC`,
      [chatId]
    );

    return NextResponse.json(createApiResponse({ chat: chatRows[0], messages }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch messages'), { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const { chatId } = params;
    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(createApiError('VALIDATION_ERROR', 'Message content is required'), { status: 400 });
    }

    const [chatRows]: any = await mysqlPool.query(
      `SELECT * FROM CounsellorChats WHERE id = ? AND studentId = ?`,
      [chatId, session.userId]
    );
    if (chatRows.length === 0) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Chat not found'), { status: 404 });
    }

    const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await mysqlPool.query(
      `INSERT INTO CounsellorMessages (id, chatId, senderId, senderRole, content) VALUES (?, ?, ?, 'STUDENT', ?)`,
      [msgId, chatId, session.userId, content.trim()]
    );

    const [msgCount]: any = await mysqlPool.query(
      `SELECT COUNT(*) as count FROM CounsellorMessages WHERE chatId = ? AND senderRole = 'STUDENT'`,
      [chatId]
    );

    if (msgCount[0].count === 1) {
      const botId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await mysqlPool.query(
        `INSERT INTO CounsellorMessages (id, chatId, senderId, senderRole, content) VALUES (?, ?, ?, 'BOT', 'Thank you for reaching out! A counsellor will be with you shortly. In the meantime, feel free to share more details about your query.')`,
        [botId, chatId, session.userId]
      );
    }

    return NextResponse.json(createApiResponse({ messageId: msgId }), { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to send message'), { status: 500 });
  }
}
