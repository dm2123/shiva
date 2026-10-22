import { NextRequest, NextResponse } from "next/server";
import { mysqlPool } from "@/lib/db";
import { requireRoleOneOf, requireRole } from "@/lib/rbac";
import { UserRole } from "@/types/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRoleOneOf(req, [UserRole.STUDENT, UserRole.TEACHER]);

  const { id } = await params;

  const [rows] = await mysqlPool.query(
    `SELECT a.*, c.title AS courseName
     FROM Assignments a
     JOIN Courses c ON c.id = a.courseId
     WHERE a.id = ?`,
    [id]
  );

  const assignment = (rows as any[])[0];
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  const [submissions] = await mysqlPool.query(
    `SELECT s.* FROM AssignmentSubmissions s
     WHERE s.assignmentId = ? AND s.studentId = ?`,
    [id, session.userId]
  );

  return NextResponse.json({
    assignment,
    submission: (submissions as any[])[0] || null,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole(req, UserRole.STUDENT);

  const { id } = await params;
  const body = await req.json();
  const { content, fileUrl } = body;

  const [existing] = await mysqlPool.query(
    `SELECT id FROM AssignmentSubmissions WHERE assignmentId = ? AND studentId = ?`,
    [id, session.userId]
  );

  if ((existing as any[]).length > 0) {
    return NextResponse.json({ error: "Already submitted" }, { status: 400 });
  }

  const subId = `asub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await mysqlPool.query(
    `INSERT INTO AssignmentSubmissions (id, assignmentId, studentId, content, fileUrl, status)
     VALUES (?, ?, ?, ?, ?, 'SUBMITTED')`,
    [subId, id, session.userId, content || null, fileUrl || null]
  );

  return NextResponse.json({ id: subId }, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireRole(req, UserRole.TEACHER);

  const { id } = await params;
  const { submissionId, marks, feedback } = await req.json();

  if (!submissionId || marks === undefined) {
    return NextResponse.json({ error: "Missing submissionId or marks" }, { status: 400 });
  }

  await mysqlPool.query(
    `UPDATE AssignmentSubmissions SET marksObtained = ?, feedback = ?, status = 'GRADED', gradedAt = NOW()
     WHERE id = ? AND assignmentId = ?`,
    [marks, feedback || null, submissionId, id]
  );

  return NextResponse.json({ success: true });
}
