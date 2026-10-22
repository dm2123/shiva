import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);

    // Overall stats
    const [overall]: any = await mysqlPool.query(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) AS open,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS inProgress,
        SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved,
        SUM(CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END) AS closed,
        AVG(CASE WHEN resolvedAt IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, createdAt, resolvedAt) END) AS avgResponseMinutes,
        SUM(CASE WHEN slaDeadline < NOW() AND status NOT IN ('RESOLVED','CLOSED') THEN 1 ELSE 0 END) AS slaBreaches
       FROM Doubts`
    );

    // By priority
    const [byPriority]: any = await mysqlPool.query(
      `SELECT priority, COUNT(*) AS count
       FROM Doubts
       WHERE status NOT IN ('RESOLVED', 'CLOSED')
       GROUP BY priority
       ORDER BY FIELD(priority, 'URGENT', 'HIGH', 'MEDIUM', 'LOW')`
    );

    // Teacher leaderboard
    const [teacherLeaderboard]: any = await mysqlPool.query(
      `SELECT tp.name, d.assignedTo AS teacherId,
              COUNT(*) AS total,
              SUM(CASE WHEN d.status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved,
              AVG(CASE WHEN d.resolvedAt IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, d.createdAt, d.resolvedAt) END) AS avgMinutes
       FROM Doubts d
       JOIN TeacherProfiles tp ON d.assignedTo = tp.userId
       WHERE d.assignedTo IS NOT NULL
       GROUP BY d.assignedTo, tp.name
       ORDER BY resolved DESC
       LIMIT 10`
    );

    // SLA compliance
    const [slaCompliance]: any = await mysqlPool.query(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN resolvedAt <= slaDeadline THEN 1 ELSE 0 END) AS met
       FROM Doubts
       WHERE status = 'RESOLVED' AND slaDeadline IS NOT NULL`
    );

    return NextResponse.json({
      success: true,
      data: {
        overall: overall[0] || {},
        byPriority,
        teacherLeaderboard,
        slaCompliance: slaCompliance[0] || { total: 0, met: 0 }
      }
    });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
