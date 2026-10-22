import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.STUDENT);

    // Get weekly schedule
    const [schedule]: any = await mysqlPool.query(
      `SELECT bs.*, s.name AS subjectName, tp.name AS teacherName
       FROM BatchSchedule bs
       LEFT JOIN Subjects s ON bs.subjectId = s.id
       LEFT JOIN TeacherProfiles tp ON bs.teacherId = tp.userId
       WHERE bs.batchId = ? AND bs.isActive = 1
       ORDER BY bs.dayOfWeek, bs.startTime`,
      [params.id]
    );

    // Get batch info
    const [batches]: any = await mysqlPool.query(
      'SELECT b.*, c.title AS courseTitle FROM Batches b LEFT JOIN Courses c ON b.courseId = c.id WHERE b.id = ?',
      [params.id]
    );

    // Group by day
    const timetable: Record<number, any[]> = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []
    };
    schedule.forEach((s: any) => {
      timetable[s.dayOfWeek]?.push(s);
    });

    return NextResponse.json({
      success: true,
      data: {
        batch: batches[0] || null,
        timetable,
        schedule
      }
    });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
