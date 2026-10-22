import { NextRequest, NextResponse } from "next/server";
import { mysqlPool } from "@/lib/db";
import { requireRoleOneOf, requireRole } from "@/lib/rbac";
import { UserRole } from "@/types/auth";

export async function POST(req: NextRequest) {
  const session = await requireRole(req, UserRole.STUDENT);

  const { liveClassId, teachingQuality, contentClarity, engagement, feedback } =
    await req.json();

  if (!liveClassId || !teachingQuality || !contentClarity || !engagement) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [lc]: any = await mysqlPool.query('SELECT teacherId FROM LiveClasses WHERE id = ?', [liveClassId]);
  const teacherId = lc[0]?.teacherId;

  const [existing] = await mysqlPool.query(
    `SELECT id FROM InstructorRatings WHERE liveClassId = ? AND studentId = ?`,
    [liveClassId, session.userId]
  );

  if ((existing as any[]).length > 0) {
    return NextResponse.json({ error: "Already rated" }, { status: 400 });
  }

  await mysqlPool.query(
    `INSERT INTO InstructorRatings (liveClassId, teacherId, studentId, teachingQuality, contentClarity, engagement, feedback)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [liveClassId, teacherId, session.userId, teachingQuality, contentClarity, engagement, feedback || null]
  );

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await requireRoleOneOf(req, [UserRole.STUDENT, UserRole.TEACHER]);

  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get("teacherId");

  if (!teacherId) {
    return NextResponse.json({ error: "teacherId required" }, { status: 400 });
  }

  const [rows] = await mysqlPool.query(
    `SELECT
      AVG(teachingQuality) AS avgTeaching,
      AVG(contentClarity) AS avgClarity,
      AVG(engagement) AS avgEngagement,
      AVG((teachingQuality + contentClarity + engagement) / 3) AS avgOverall,
      COUNT(*) AS totalRatings
     FROM InstructorRatings ir
     JOIN LiveClasses lc ON lc.id = ir.liveClassId
     WHERE lc.teacherId = ?`,
    [teacherId]
  );

  const [recent] = await mysqlPool.query(
    `SELECT ir.*, sp.name AS studentName
     FROM InstructorRatings ir
     JOIN LiveClasses lc ON lc.id = ir.liveClassId
     JOIN StudentProfiles sp ON sp.userId = ir.studentId
     WHERE lc.teacherId = ?
     ORDER BY ir.createdAt DESC
     LIMIT 10`,
    [teacherId]
  );

  return NextResponse.json({
    averages: (rows as any[])[0],
    recentRatings: recent,
  });
}
