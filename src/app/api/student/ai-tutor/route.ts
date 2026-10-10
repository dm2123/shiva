import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, UserRole.STUDENT);
    const { message, sessionId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const pool = mysqlPool;

    let currentSessionId = sessionId;

    if (!currentSessionId) {
      const [sessionResult] = await pool.execute(
        'INSERT INTO AiTutorSessions (studentId, subject, topic, createdAt) VALUES (?, ?, ?, NOW())',
        [user.userId, message.substring(0, 50), message.substring(0, 100)]
      );
      currentSessionId = (sessionResult as any).insertId;
    }

    await pool.execute(
      'INSERT INTO AiTutorMessages (sessionId, role, content, createdAt) VALUES (?, ?, ?, NOW())',
      [currentSessionId, 'user', message]
    );

    const lowerMessage = message.toLowerCase();
    let aiResponse = '';

    if (lowerMessage.includes('physics')) {
      aiResponse = 'Physics is the study of matter, energy, and their interactions. Key topics include mechanics, thermodynamics, electromagnetism, and quantum physics. For competitive exams, focus on understanding concepts and practicing numerical problems regularly.';
    } else if (lowerMessage.includes('math')) {
      aiResponse = 'Mathematics requires consistent practice. Start with algebra and trigonometry basics, then move to calculus and coordinate geometry. Solve previous year questions and focus on understanding the underlying concepts rather than memorizing formulas.';
    } else if (lowerMessage.includes('chemistry')) {
      aiResponse = 'Chemistry is divided into organic, inorganic, and physical chemistry. For exams like JEE and NEET, focus on reaction mechanisms, periodic table trends, and thermodynamics. Practice naming reactions and solve numerical problems regularly.';
    } else if (lowerMessage.includes('biology')) {
      aiResponse = 'Biology requires both understanding and memorization. Focus on cell biology, genetics, ecology, and human physiology. Create diagrams and flowcharts to visualize concepts. Revise regularly and practice with diagrams.';
    } else if (lowerMessage.includes('exam') || lowerMessage.includes('prepare')) {
      aiResponse = 'For effective exam preparation: 1) Create a study schedule, 2) Focus on weak areas, 3) Practice previous year papers, 4) Take regular breaks, 5) Maintain a healthy routine. Would you like me to create a detailed study plan?';
    } else {
      aiResponse = 'I am here to help you with your studies. Please ask me about specific subjects like Physics, Mathematics, Chemistry, or Biology, or mention exam preparation tips. I can explain concepts, provide study strategies, and help clarify doubts.';
    }

    await pool.execute(
      'INSERT INTO AiTutorMessages (sessionId, role, content, createdAt) VALUES (?, ?, ?, NOW())',
      [currentSessionId, 'assistant', aiResponse]
    );

    return NextResponse.json({
      sessionId: currentSessionId,
      response: aiResponse
    });
  } catch (error) {
    console.error('AI Tutor POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, UserRole.STUDENT);
    const pool = mysqlPool;

    const [sessions] = await pool.execute(
      'SELECT * FROM AiTutorSessions WHERE studentId = ? ORDER BY createdAt DESC',
      [user.userId]
    );

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('AI Tutor GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}