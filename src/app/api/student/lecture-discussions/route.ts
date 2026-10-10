import { NextRequest, NextResponse } from "next/server";
import { mysqlPool } from "@/lib/db";
import { requireRoleOneOf, requireRole } from "@/lib/rbac";
import { UserRole } from "@/types/auth";

export async function GET(req: NextRequest) {
  const session = await requireRoleOneOf(req, [UserRole.STUDENT, UserRole.TEACHER]);

  const { searchParams } = new URL(req.url);
  const lectureId = searchParams.get("lectureId");

  if (!lectureId) {
    return NextResponse.json({ error: "lectureId required" }, { status: 400 });
  }

  const [rows] = await mysqlPool.query(
    `SELECT ld.*, sp.name AS authorName,
      (SELECT COUNT(*) FROM LectureDiscussions r WHERE r.parentId = ld.id) AS replyCount
     FROM LectureDiscussions ld
     LEFT JOIN StudentProfiles sp ON sp.userId = ld.studentId
     WHERE ld.lectureId = ? AND ld.parentId IS NULL
     ORDER BY ld.timestampSeconds ASC, ld.createdAt ASC`,
    [lectureId]
  );

  const discussions = rows as any[];

  for (const d of discussions) {
    const [replies] = await mysqlPool.query(
      `SELECT ld.*, sp.name AS authorName
       FROM LectureDiscussions ld
       LEFT JOIN StudentProfiles sp ON sp.userId = ld.studentId
       WHERE ld.parentId = ?
       ORDER BY ld.createdAt ASC`,
      [d.id]
    );
    d.replies = replies;
  }

  return NextResponse.json({ discussions });
}

export async function POST(req: NextRequest) {
  const session = await requireRoleOneOf(req, [UserRole.STUDENT, UserRole.TEACHER]);

  const { lectureId, content, parentId, timestampSeconds } = await req.json();

  if (!lectureId || !content) {
    return NextResponse.json({ error: "lectureId and content required" }, { status: 400 });
  }

  const [result] = await mysqlPool.query(
    `INSERT INTO LectureDiscussions (lectureId, studentId, content, parentId, timestampSeconds)
     VALUES (?, ?, ?, ?, ?)`,
    [lectureId, session.userId, content, parentId || null, timestampSeconds || null]
  );

  return NextResponse.json({ id: (result as any).insertId }, { status: 201 });
}
