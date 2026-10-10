import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await requireRole(request, UserRole.STUDENT);

  try {
    const [rows] = await mysqlPool.query(
      'SELECT * FROM VoiceDoubts WHERE studentId = ? ORDER BY createdAt DESC',
      [session.userId]
    );
    return NextResponse.json({ doubts: rows });
  } catch (error) {
    console.error('Error fetching voice doubts:', error);
    return NextResponse.json({ error: 'Failed to fetch voice doubts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireRole(request, UserRole.STUDENT);

  try {
    const { audioBase64, subject, topic } = await request.json();

    if (!audioBase64 || !subject || !topic) {
      return NextResponse.json({ error: 'audioBase64, subject, and topic are required' }, { status: 400 });
    }

    const transcript = `[Mock transcription for ${subject} - ${topic}] I have a doubt about the concept of ${topic} in ${subject}. Can you explain it clearly with an example?`;

    const aiResponse = `Great question about ${topic} in ${subject}! Here's the explanation:\n\n` +
      `**${topic}** is a fundamental concept in ${subject}. ` +
      `It involves understanding the core principles and applying them to real-world scenarios.\n\n` +
      `**Key Points:**\n` +
      `1. The concept is based on established principles in ${subject}\n` +
      `2. It can be broken down into simpler components for better understanding\n` +
      `3. Practice problems are the best way to master this topic\n\n` +
      `**Example:** Consider a scenario where ${topic} is applied. ` +
      `The step-by-step approach helps visualize the concept better.\n\n` +
      `**Tips:** Review the related formulas and solve at least 10 practice problems on ${topic}.`;

    const [result] = await mysqlPool.query(
      'INSERT INTO VoiceDoubts (studentId, subject, topic, transcript, aiResponse, audioUrl) VALUES (?, ?, ?, ?, ?, ?)',
      [session.userId, subject, topic, transcript, aiResponse, null]
    );

    return NextResponse.json({
      doubt: {
        id: (result as any).insertId,
        subject,
        topic,
        transcript,
        aiResponse,
      },
    });
  } catch (error) {
    console.error('Error processing voice doubt:', error);
    return NextResponse.json({ error: 'Failed to process voice doubt' }, { status: 500 });
  }
}
