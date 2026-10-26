import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { ensureBatchScheduleSchema } from '@/lib/ensure-batch-schedule-schema';
import { ensureAnalyticsSchema } from '@/lib/ensure-analytics-schema';
import { ensureLiveClassSchema } from '@/lib/ensure-live-class-schema';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.STUDENT);
    // BatchSchedule / TeacherProfiles (naya ensure) + Subjects (analytics
    // ensure) + LiveClasses (live-class ensure) purane DB par missing hon
    // to LEFT JOIN ke bawajood query 1146 par 500 deti — pehle self-heal.
    await ensureBatchScheduleSchema();
    await ensureAnalyticsSchema();
    await ensureLiveClassSchema();
    const today = new Date().getDay();

    const [classes]: any = await mysqlPool.query(
      `SELECT bs.*, s.name AS subjectName, tp.name AS teacherName,
              lc.id AS liveClassId, lc.status AS liveStatus
       FROM BatchSchedule bs
       LEFT JOIN Subjects s ON bs.subjectId = s.id
       LEFT JOIN TeacherProfiles tp ON bs.teacherId = tp.userId
       LEFT JOIN LiveClasses lc ON lc.batchId = bs.batchId 
         AND DATE(lc.startTime) = CURDATE()
         AND HOUR(lc.startTime) = HOUR(bs.startTime)
       WHERE bs.batchId = ? AND bs.dayOfWeek = ? AND bs.isActive = 1
       ORDER BY bs.startTime`,
      [params.id, today]
    );

    return NextResponse.json({ success: true, data: { classes, dayOfWeek: today } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
