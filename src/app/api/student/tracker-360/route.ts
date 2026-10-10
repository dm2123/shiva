import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { randomUUID } from 'crypto';

// GET - Get Tracker 360 plan + tasks + reviews
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const weekStart = searchParams.get('weekStart');

    // Get active plan
    const [plans]: any = await mysqlPool.query(
      `SELECT tp.*,
        (SELECT COUNT(*) FROM Tracker360DailyTasks WHERE planId = tp.id AND status = 'COMPLETED') AS completedTasks,
        (SELECT COUNT(*) FROM Tracker360DailyTasks WHERE planId = tp.id) AS totalTasks
       FROM Tracker360Plans tp WHERE tp.userId = ? AND tp.status = 'ACTIVE' LIMIT 1`,
      [session.userId]
    );

    if (plans.length === 0) {
      return NextResponse.json({ success: true, data: { plan: null, tasks: [], reviews: [] } });
    }

    const plan = plans[0];

    // Get tasks for date range
    const [tasks]: any = await mysqlPool.query(
      `SELECT t.*, s.name AS subjectName, c.name AS chapterName
       FROM Tracker360DailyTasks t
       LEFT JOIN Subjects s ON t.subjectId = s.id
       LEFT JOIN Chapters c ON t.chapterId = c.id
       WHERE t.planId = ? AND t.taskDate >= DATE_SUB(?, INTERVAL 7 DAY) AND t.taskDate <= DATE_ADD(?, INTERVAL 7 DAY)
       ORDER BY t.taskDate, t.taskType`,
      [plan.id, date, date]
    );

    // Get today's tasks specifically
    const todayTasks = tasks.filter((t: any) => new Date(t.taskDate).toISOString().split('T')[0] === date);

    // Get weekly reviews
    const [reviews]: any = await mysqlPool.query(
      `SELECT * FROM Tracker360WeeklyReview WHERE planId = ? ORDER BY weekStart DESC LIMIT 8`,
      [plan.id]
    );

    // Get streak
    const [streak]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS streak FROM DailyStreaks WHERE userId = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      [session.userId]
    );

    // Calculate stats
    const completedToday = todayTasks.filter((t: any) => t.status === 'COMPLETED').length;
    const totalToday = todayTasks.length;
    const totalMinutesToday = todayTasks.reduce((sum: number, t: any) => sum + (t.status === 'COMPLETED' ? t.estimatedMinutes : 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        plan: { ...plan, completedTasks: plan.completedTasks, totalTasks: plan.totalTasks },
        tasks,
        todayTasks,
        reviews,
        stats: {
          currentStreak: streak[0]?.streak || 0,
          completedToday,
          totalToday,
          totalMinutesToday,
          completionPercent: plan.totalTasks > 0 ? Math.round((plan.completedTasks / plan.totalTasks) * 100) : 0,
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create plan or add task or update task
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const body = await request.json();
    const { action } = body;

    if (action === 'create_plan') {
      const id = randomUUID();
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + (body.totalDays || 90) * 86400000).toISOString().split('T')[0];
      await mysqlPool.query(
        `INSERT INTO Tracker360Plans (id, userId, name, targetExam, examDate, pace, totalDays, dailyStudyHours, startDate, endDate)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, session.userId, body.name || 'My Study Plan', body.targetExam, body.examDate,
         body.pace || 'MODERATE', body.totalDays || 90, body.dailyStudyHours || 6, startDate, endDate]
      );
      return NextResponse.json({ success: true, id });
    }

    if (action === 'add_task') {
      const id = randomUUID();
      await mysqlPool.query(
        `INSERT INTO Tracker360DailyTasks (id, planId, userId, taskDate, subjectId, chapterId, topic, taskType, title, description, estimatedMinutes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, body.planId, session.userId, body.taskDate, body.subjectId || null, body.chapterId || null,
         body.topic || null, body.taskType || 'STUDY', body.title, body.description || null, body.estimatedMinutes || 60]
      );
      return NextResponse.json({ success: true, id });
    }

    if (action === 'update_task') {
      const updates: string[] = [];
      const values: any[] = [];
      if (body.status) { updates.push('status = ?'); values.push(body.status); }
      if (body.completionPercent !== undefined) { updates.push('completionPercent = ?'); values.push(body.completionPercent); }
      if (body.actualMinutes !== undefined) { updates.push('actualMinutes = ?'); values.push(body.actualMinutes); }
      if (body.status === 'COMPLETED') { updates.push('completedAt = NOW()'); updates.push('completionPercent = 100'); }
      if (updates.length === 0) return NextResponse.json({ error: 'No updates' }, { status: 400 });
      values.push(body.taskId);
      await mysqlPool.query(`UPDATE Tracker360DailyTasks SET ${updates.join(', ')} WHERE id = ?`, values);

      // Auto-update plan completion
      if (body.planId) {
        await mysqlPool.query(
          `UPDATE Tracker360Plans SET completionPercent = (
            SELECT ROUND(COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2)
            FROM Tracker360DailyTasks WHERE planId = ?
          ) WHERE id = ?`,
          [body.planId, body.planId]
        );
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
