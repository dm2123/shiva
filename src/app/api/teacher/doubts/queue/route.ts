import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { ensureDoubtsSchema } from '@/lib/ensure-doubts-schema';
import { ensureBatchScheduleSchema } from '@/lib/ensure-batch-schedule-schema';
import { ensureStudentProfileSchema } from '@/lib/ensure-student-profile-schema';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.TEACHER);
    // Doubts/DoubtMessages missing hon to queue + SLA count 1146 par 500 dete;
    // TeacherProfiles missing ho to teesra filter ka LEFT JOIN bhi 1146 deta;
    // StudentProfiles missing ho to teenon filters ka JOIN 1146 deta.
    await ensureDoubtsSchema();
    await ensureBatchScheduleSchema();
    await ensureStudentProfileSchema();
    const url = new URL(req.url);
    const filter = url.searchParams.get('filter') || 'assigned';

    let query: string;
    let params: any[];

    if (filter === 'assigned') {
      query = `
        SELECT d.*, sp.name AS studentName,
               TIMESTAMPDIFF(MINUTE, d.createdAt, COALESCE(d.resolvedAt, NOW())) AS waitMinutes
        FROM Doubts d
        JOIN StudentProfiles sp ON d.studentId = sp.userId
        WHERE d.assignedTo = ? AND d.status NOT IN ('RESOLVED', 'CLOSED')
        ORDER BY FIELD(d.priority, 'URGENT', 'HIGH', 'MEDIUM', 'LOW'), d.createdAt ASC
      `;
      params = [session.userId];
    } else if (filter === 'unassigned') {
      query = `
        SELECT d.*, sp.name AS studentName,
               TIMESTAMPDIFF(MINUTE, d.createdAt, NOW()) AS waitMinutes
        FROM Doubts d
        JOIN StudentProfiles sp ON d.studentId = sp.userId
        WHERE d.assignedTo IS NULL AND d.status = 'OPEN'
        ORDER BY FIELD(d.priority, 'URGENT', 'HIGH', 'MEDIUM', 'LOW'), d.createdAt ASC
        LIMIT 20
      `;
      params = [];
    } else {
      query = `
        SELECT d.*, sp.name AS studentName,
               tp.name AS assignedToName,
               TIMESTAMPDIFF(MINUTE, d.createdAt, COALESCE(d.resolvedAt, NOW())) AS waitMinutes
        FROM Doubts d
        JOIN StudentProfiles sp ON d.studentId = sp.userId
        LEFT JOIN TeacherProfiles tp ON d.assignedTo = tp.userId
        WHERE d.status NOT IN ('CLOSED')
        ORDER BY d.createdAt DESC
        LIMIT 50
      `;
      params = [];
    }

    const [rows]: any = await mysqlPool.query(query, params);

    // Get SLA breach count
    const [breaches]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS count FROM Doubts 
       WHERE status NOT IN ('RESOLVED', 'CLOSED') AND slaDeadline < NOW()`
    );

    return NextResponse.json({
      success: true,
      data: {
        doubts: rows,
        slaBreaches: breaches[0]?.count || 0
      }
    });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
