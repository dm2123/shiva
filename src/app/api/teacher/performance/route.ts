import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

// GET - Get teacher performance metrics
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.TEACHER);
    const { searchParams } = new URL(request.url);
    const weeks = parseInt(searchParams.get('weeks') || '8');

    const [performance]: any = await mysqlPool.query(
      `SELECT * FROM TeacherPerformance WHERE teacherId = ? ORDER BY weekStart DESC LIMIT ?`,
      [session.userId, weeks]
    );

    // Aggregate stats
    const totalClasses = performance.reduce((sum: number, p: any) => sum + p.classesConducted, 0);
    const totalScheduled = performance.reduce((sum: number, p: any) => sum + p.classesScheduled, 0);
    const totalCancelled = performance.reduce((sum: number, p: any) => sum + p.classesCancelled, 0);
    const avgAttendance = performance.length > 0
      ? performance.reduce((sum: number, p: any) => sum + parseFloat(p.avgAttendancePercent), 0) / performance.length
      : 0;
    const avgRating = performance.length > 0
      ? performance.reduce((sum: number, p: any) => sum + parseFloat(p.avgStudentRating), 0) / performance.length
      : 0;
    const totalHours = performance.reduce((sum: number, p: any) => sum + parseFloat(p.liveClassHours), 0);
    const totalDoubts = performance.reduce((sum: number, p: any) => sum + p.doubtsResolved, 0);
    const avgEngagement = performance.length > 0
      ? performance.reduce((sum: number, p: any) => sum + parseFloat(p.engagementScore), 0) / performance.length
      : 0;

    // Live class stats
    const [liveStats]: any = await mysqlPool.query(
      `SELECT
        COUNT(*) AS totalLiveClasses,
        SUM(CASE WHEN status = 'LIVE' THEN 1 ELSE 0 END) AS activeNow,
        SUM(CASE WHEN status = 'ENDED' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'SCHEDULED' THEN 1 ELSE 0 END) AS upcoming
       FROM LiveClasses WHERE teacherId = ?`, [session.userId]
    );

    // Student stats
    const [studentStats]: any = await mysqlPool.query(
      `SELECT COUNT(DISTINCT se.studentId) AS totalStudents
       FROM StudentEnrollments se
       JOIN Batches b ON se.batchId = b.id
       WHERE b.teacherId = ? AND se.status = 'ACTIVE'`, [session.userId]
    );

    // Doubt stats
    const [doubtStats]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS totalDoubts,
        SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved
       FROM Doubts WHERE teacherId = ?`, [session.userId]
    );

    // Rating stats
    const [ratingStats]: any = await mysqlPool.query(
      `SELECT AVG(rating) AS avgRating, COUNT(*) AS totalRatings
       FROM InstructorRatings WHERE teacherId = ?`, [session.userId]
    );

    return NextResponse.json({
      success: true,
      data: {
        weekly: performance,
        summary: {
          totalClasses,
          totalScheduled,
          totalCancelled,
          attendanceRate: Math.round(avgAttendance * 10) / 10,
          avgRating: Math.round(avgRating * 100) / 100,
          totalHours: Math.round(totalHours * 10) / 10,
          totalDoubts,
          engagementScore: Math.round(avgEngagement * 10) / 10,
          totalStudents: studentStats[0]?.totalStudents || 0,
          activeLiveClasses: liveStats[0]?.activeNow || 0,
          totalLiveClasses: liveStats[0]?.totalLiveClasses || 0,
          doubtResolutionRate: doubtStats[0]?.totalDoubts > 0
            ? Math.round((doubtStats[0].resolved / doubtStats[0].totalDoubts) * 100)
            : 0,
          platformRating: parseFloat(ratingStats[0]?.avgRating || '0'),
          totalPlatformRatings: ratingStats[0]?.totalRatings || 0
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
