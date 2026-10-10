import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.STUDENT);
    const today = new Date().getDay();

    // Get next 7 days of classes
    const upcoming: any[] = [];
    for (let i = 0; i < 7; i++) {
      const day = (today + i) % 7;
      const [classes]: any = await mysqlPool.query(
        `SELECT bs.*, s.name AS subjectName, tp.name AS teacherName
         FROM BatchSchedule bs
         LEFT JOIN Subjects s ON bs.subjectId = s.id
         LEFT JOIN TeacherProfiles tp ON bs.teacherId = tp.userId
         WHERE bs.batchId = ? AND bs.dayOfWeek = ? AND bs.isActive = 1
         ORDER BY bs.startTime`,
        [params.id, day]
      );

      if (classes.length > 0) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        upcoming.push({
          date: date.toISOString().split('T')[0],
          dayOfWeek: day,
          classes
        });
      }
    }

    return NextResponse.json({ success: true, data: { upcoming } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
