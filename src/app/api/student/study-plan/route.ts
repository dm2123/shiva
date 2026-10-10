import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const { targetExam, targetDate } = await request.json();

    if (!targetExam || !targetDate) {
      return NextResponse.json({ error: 'Target exam and date are required' }, { status: 400 });
    }

    const [planResult] = await mysqlPool.execute(
      'INSERT INTO AiStudyPlans (studentId, targetExam, targetDate, title, status, createdAt) VALUES (?, ?, ?, ?, \'ACTIVE\', NOW())',
      [session.userId, targetExam, targetDate, `${targetExam} Study Plan`]
    );

    const planId = (planResult as any).insertId;

    const subjects = targetExam === 'JEE' 
      ? ['Physics', 'Mathematics', 'Chemistry']
      : targetExam === 'NEET'
      ? ['Physics', 'Chemistry', 'Biology']
      : ['Physics', 'Mathematics', 'Chemistry', 'English'];

    const startDate = new Date();
    const endDate = new Date(targetDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysToCreate = Math.min(totalDays, 30);

    for (let day = 1; day <= daysToCreate; day++) {
      const subjectIndex = (day - 1) % subjects.length;
      const subject = subjects[subjectIndex];
      
      const [taskResult] = await mysqlPool.execute(
        'INSERT INTO AiStudyPlanTasks (planId, dayNumber, subject, topic, taskType, durationMinutes, completed) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
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
    console.error('Study Plan POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);

    const [plans] = await mysqlPool.execute(
      'SELECT * FROM AiStudyPlans WHERE studentId = ? ORDER BY createdAt DESC',
      [session.userId]
    );

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Study Plan GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}