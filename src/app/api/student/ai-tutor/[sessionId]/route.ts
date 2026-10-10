import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await requireRole(request, UserRole.STUDENT);
    const pool = mysqlPool;
    const sessionId = params.sessionId;

    const [messages] = await pool.execute(
      'SELECT * FROM AiTutorMessages WHERE sessionId = ? ORDER BY createdAt ASC',
      [sessionId]
    );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('AI Tutor Session GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await requireRole(request, UserRole.STUDENT);
    const { message } = await request.json();
    const pool = mysqlPool;
    const sessionId = params.sessionId;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await pool.execute(
      'INSERT INTO AiTutorMessages (sessionId, role, content, createdAt) VALUES (?, ?, ?, NOW())',
      [sessionId, 'user', message]
    );

    const lowerMessage = message.toLowerCase();
    let aiResponse = '';

    if (lowerMessage.includes('physics')) {
      aiResponse = 'Let me explain that physics concept in detail. Remember to focus on understanding the fundamental principles and practice solving related problems.';
    } else if (lowerMessage.includes('math')) {
      aiResponse = 'Mathematics problems require step-by-step approach. Break down the problem, identify the given values, and apply the relevant formulas.';
    } else if (lowerMessage.includes('chemistry')) {
      aiResponse = 'Chemistry concepts are interconnected. Make sure you understand the basics before moving to advanced topics.';
    } else if (lowerMessage.includes('biology')) {
      aiResponse = 'Biology involves understanding processes and systems. Try to visualize and draw diagrams to better grasp the concepts.';
    } else {
      aiResponse = 'That is an interesting question. Let me help you understand this better. Could you provide more specific details about what you would like to know?';
    }

    await pool.execute(
      'INSERT INTO AiTutorMessages (sessionId, role, content, createdAt) VALUES (?, ?, ?, NOW())',
      [sessionId, 'assistant', aiResponse]
    );

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('AI Tutor Session POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}