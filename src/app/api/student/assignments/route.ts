import { NextRequest, NextResponse } from "next/server";
import { mysqlPool } from "@/lib/db";
import { requireRoleOneOf, requireRole } from "@/lib/rbac";
import { UserRole } from "@/types/auth";

export async function GET(req: NextRequest) {
  const session = await requireRoleOneOf(req, [UserRole.STUDENT, UserRole.TEACHER]);

  const userId = session.userId;

  const [assignments] = await mysqlPool.query(
    `SELECT a.*, c.title AS courseName,
      (SELECT COUNT(*) FROM AssignmentSubmissions s WHERE s.assignmentId = a.id AND s.studentId = ?) AS submitted,
      (SELECT s.id FROM AssignmentSubmissions s WHERE s.assignmentId = a.id AND s.studentId = ? LIMIT 1) AS submissionId,
      (SELECT s.marksObtained FROM AssignmentSubmissions s WHERE s.assignmentId = a.id AND s.studentId = ? LIMIT 1) AS marks
     FROM Assignments a
     JOIN Courses c ON c.id = a.courseId
     JOIN StudentEnrollments e ON e.courseId = a.courseId AND e.studentId = ?
     ORDER BY a.dueDate ASC`,
    [userId, userId, userId, userId]
  );

  return NextResponse.json({ assignments });
}

export async function POST(req: NextRequest) {
  const session = await requireRole(req, UserRole.TEACHER);

  const { courseId, title, description, dueDate } = await req.json();

  if (!courseId || !title || !dueDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = `asgn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await mysqlPool.query(
    `INSERT INTO Assignments (id, courseId, title, description, dueDate)
     VALUES (?, ?, ?, ?, ?)`,
    [id, courseId, title, description || null, dueDate]
  );

  return NextResponse.json({ id }, { status: 201 });
}
