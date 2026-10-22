import { NextRequest, NextResponse } from "next/server";
import { mysqlPool } from "@/lib/db";
import { requireRoleOneOf, requireRole } from "@/lib/rbac";
import { UserRole } from "@/types/auth";

export async function GET(req: NextRequest) {
  const session = await requireRoleOneOf(req, [UserRole.STUDENT, UserRole.TEACHER]);

  try {
    const { searchParams } = new URL(req.url);
    const lectureId = searchParams.get("lectureId");
    const subject = searchParams.get("subject");

    let where = "WHERE 1=1";
    const params: any[] = [];

    if (lectureId) {
      where += " AND vn.lectureId = ?";
      params.push(lectureId);
    }

    const [notes] = await mysqlPool.query(
      `SELECT vn.*, tp.name AS teacherName, l.title AS lectureTitle
       FROM VerifiedNotes vn
       LEFT JOIN TeacherProfiles tp ON tp.userId = vn.teacherId
       LEFT JOIN Lectures l ON vn.lectureId = l.id
       ${where}
       ORDER BY vn.createdAt DESC`,
      params
    );

    return NextResponse.json({ notes });
  } catch (error) {
    if ((error as any).name === 'AuthError') return NextResponse.json({ error: (error as any).message }, { status: (error as any).statusCode || 401 });
    console.error("Verified notes GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireRole(req, UserRole.TEACHER);

  try {
    const { lectureId, title, content, subject } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "title and content are required" },
        { status: 400 }
      );
    }

    const id = `vn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await mysqlPool.query(
      `INSERT INTO VerifiedNotes (id, lectureId, teacherId, title, content)
       VALUES (?, ?, ?, ?, ?)`,
      [id, lectureId || null, session.userId, title, content]
    );

    return NextResponse.json(
      { message: "Verified note created", id },
      { status: 201 }
    );
  } catch (error) {
    if ((error as any).name === 'AuthError') return NextResponse.json({ error: (error as any).message }, { status: (error as any).statusCode || 401 });
    console.error("Verified notes POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
