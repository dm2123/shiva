import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.PARENT);

    // Verify parent has access
    const [link]: any = await mysqlPool.query(
      'SELECT id FROM ParentStudentLinks WHERE parentId = ? AND studentId = ?',
      [(await requireRole(req, UserRole.PARENT)).userId, params.id]
    );

    if (link.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Access denied' } }, { status: 403 });
    }

    // Get enrolled courses
    const [courses]: any = await mysqlPool.query(
      `SELECT e.*, c.title, c.description
       FROM Enrollments e
       JOIN Courses c ON e.courseId = c.id
       WHERE e.studentId = ?`,
      [params.id]
    );

    // Get test scores
    const [tests]: any = await mysqlPool.query(
      `SELECT t.title, a.score, a.totalMarks, a.percentage, a.completedAt
       FROM AssessmentAttempts a
       JOIN Tests t ON a.testId = t.id
       WHERE a.studentId = ?
       ORDER BY a.completedAt DESC
       LIMIT 10`,
      [params.id]
    );

    // Get XP and streak
    const [xp]: any = await mysqlPool.query(
      'SELECT COALESCE(SUM(points), 0) AS totalXP FROM StudentXP WHERE studentId = ?',
      [params.id]
    );

    const [streak]: any = await mysqlPool.query(
      'SELECT COUNT(*) AS streak FROM DailyStreaks WHERE studentId = ?',
      [params.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        courses,
        recentTests: tests,
        totalXP: xp[0]?.totalXP || 0,
        totalStreak: streak[0]?.streak || 0
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
