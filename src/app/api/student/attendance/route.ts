import { NextRequest, NextResponse } from "next/server";
import { mysqlPool } from "@/lib/db";
import { requireRoleOneOf, requireRole } from "@/lib/rbac";
import { UserRole } from "@/types/auth";

export async function GET(req: NextRequest) {
  const session = await requireRoleOneOf(req, [UserRole.STUDENT, UserRole.TEACHER]);

  const { searchParams } = new URL(req.url);
  const liveClassId = searchParams.get("liveClassId");

  if (!liveClassId) {
    return NextResponse.json({ error: "liveClassId required" }, { status: 400 });
  }

  const [rows] = await mysqlPool.query(
    `SELECT * FROM LiveClassAttendance WHERE liveClassId = ? AND studentId = ?`,
    [liveClassId, session.userId]
  );

  const attendance = (rows as any[])[0] || null;

  const [stats] = await mysqlPool.query(
    `SELECT
      COUNT(*) AS total,
      COUNT(*) AS present
     FROM LiveClassAttendance
     WHERE studentId = ?`,
    [session.userId]
  );

  return NextResponse.json({
    attendance,
    stats: (stats as any[])[0],
  });
}

export async function POST(req: NextRequest) {
  const session = await requireRole(req, UserRole.STUDENT);

  const { liveClassId, cameraOn } = await req.json();

  if (!liveClassId) {
    return NextResponse.json({ error: "liveClassId required" }, { status: 400 });
  }

  const [existing] = await mysqlPool.query(
    `SELECT id FROM LiveClassAttendance WHERE liveClassId = ? AND studentId = ?`,
    [liveClassId, session.userId]
  );

  if ((existing as any[]).length > 0) {
    return NextResponse.json({ message: "Already marked" });
  }

  await mysqlPool.query(
    `INSERT INTO LiveClassAttendance (liveClassId, studentId, cameraOn, joinedAt)
     VALUES (?, ?, ?, NOW())`,
    [liveClassId, session.userId, cameraOn ? 1 : 0]
  );

  return NextResponse.json({ success: true }, { status: 201 });
}
