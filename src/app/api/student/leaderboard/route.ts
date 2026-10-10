import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const url = new URL(req.url);
    const courseId = url.searchParams.get('courseId');

    let query: string;
    let params: any[];

    if (courseId) {
      query = `
        SELECT lc.studentId, sp.name, SUM(lc.totalXP) AS totalXP,
               ROW_NUMBER() OVER (ORDER BY SUM(lc.totalXP) DESC) AS userRank
        FROM LeaderboardCache lc
        JOIN StudentProfiles sp ON lc.studentId = sp.userId
        WHERE lc.courseId = ?
        GROUP BY lc.studentId, sp.name
        ORDER BY totalXP DESC
        LIMIT 50
      `;
      params = [courseId];
    } else {
      query = `
        SELECT lc.studentId, sp.name, SUM(lc.totalXP) AS totalXP,
               ROW_NUMBER() OVER (ORDER BY SUM(lc.totalXP) DESC) AS userRank
        FROM LeaderboardCache lc
        JOIN StudentProfiles sp ON lc.studentId = sp.userId
        GROUP BY lc.studentId, sp.name
        ORDER BY totalXP DESC
        LIMIT 50
      `;
      params = [];
    }

    const [rows]: any = await mysqlPool.query(query, params);

    // Get current user's rank
    const [myRank]: any = await mysqlPool.query(
      `SELECT COALESCE(SUM(totalXP), 0) AS totalXP,
              (SELECT COUNT(*) + 1 FROM (
                SELECT studentId, SUM(totalXP) AS tp FROM LeaderboardCache GROUP BY studentId HAVING tp > (
                  SELECT COALESCE(SUM(totalXP), 0) FROM LeaderboardCache WHERE studentId = ?
                )
              ) ranks) AS userRank
       FROM LeaderboardCache WHERE studentId = ?`,
      [session.userId, session.userId]
    );

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: rows,
        me: myRank[0] || { totalXP: 0, userRank: rows.length + 1 }
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
