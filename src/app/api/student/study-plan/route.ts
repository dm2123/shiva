import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { ensureStudyPlanSchema } from '@/lib/ensure-study-plan-schema';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    await ensureStudyPlanSchema();
    const { targetExam, targetDate } = await request.json();

    if (!targetExam || !targetDate) {
      return NextResponse.json({ error: 'Target exam and date are required' }, { status: 400 });
    }

    // Canonical schema me id VARCHAR(36) PRIMARY KEY hai (koi default
    // nahi) — bina id ke INSERT strict mode par 1364 par fail hota aur
    // insertId hamesha 0 milta, jisse web /study-plan/0 par 404 pata.
    // Isliye plan + har task ki id yahin banti hai (doubts route jaisa).
    const planId = crypto.randomUUID();

    await mysqlPool.execute(
      'INSERT INTO AiStudyPlans (id, studentId, targetExam, targetDate, title, status, createdAt) VALUES (?, ?, ?, ?, ?, \'ACTIVE\', NOW())',
      [planId, session.userId, targetExam, targetDate, `${targetExam} Study Plan`]
    );

    const subjects = targetExam === 'JEE'
      ? ['Physics', 'Mathematics', 'Chemistry']
      : targetExam === 'NEET'
      ? ['Physics', 'Chemistry', 'Biology']
      : ['Physics', 'Mathematics', 'Chemistry', 'English'];

    const startDate = new Date();
    const endDate = new Date(targetDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysToCreate = Math.min(Math.max(totalDays, 0), 30);

    for (let day = 1; day <= daysToCreate; day++) {
      const subjectIndex = (day - 1) % subjects.length;
      const subject = subjects[subjectIndex];

      await mysqlPool.execute(
        'INSERT INTO AiStudyPlanTasks (id, planId, dayNumber, subject, topic, taskType, durationMinutes, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          crypto.randomUUID(),
          planId,
          day,
          subject,
          `Day ${day} ${subject} Focus`,
          'STUDY',
          60,
          false
        ]
      );
    }

    return NextResponse.json({
      planId,
      message: 'Study plan created successfully',
      totalDays: daysToCreate
    });
  } catch (error) {
    if ((error as any).name === 'AuthError') return NextResponse.json({ error: (error as any).message }, { status: (error as any).statusCode || 401 });
    console.error('Study Plan POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    await ensureStudyPlanSchema();

    const [plans] = await mysqlPool.execute(
      'SELECT * FROM AiStudyPlans WHERE studentId = ? ORDER BY createdAt DESC',
      [session.userId]
    );

    return NextResponse.json({ plans });
  } catch (error) {
    if ((error as any).name === 'AuthError') return NextResponse.json({ error: (error as any).message }, { status: (error as any).statusCode || 401 });
    console.error('Study Plan GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}