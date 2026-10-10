import { NextRequest, NextResponse } from "next/server";
import { mysqlPool } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { UserRole } from "@/types/auth";

export async function POST(req: NextRequest) {
  const session = await requireRole(req, UserRole.STUDENT);

  try {
    const { name, courseId, maxMembers, isPrivate } = await req.json();

    if (!name || !maxMembers) {
      return NextResponse.json(
        { error: "name and maxMembers are required" },
        { status: 400 }
      );
    }

    const groupId = `sg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await mysqlPool.query(
      `INSERT INTO StudyGroups (id, name, courseId, createdBy, maxMembers, isPrivate)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [groupId, name, courseId || null, session.userId, maxMembers, isPrivate ? 1 : 0]
    );

    const memberId = `sgm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await mysqlPool.query(
      `INSERT INTO StudyGroupMembers (id, groupId, studentId, role)
       VALUES (?, ?, ?, 'ADMIN')`,
      [memberId, groupId, session.userId]
    );

    return NextResponse.json(
      { message: "Study group created", groupId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Study groups POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await requireRole(req, UserRole.STUDENT);

  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let where = "WHERE sg.isPrivate = 0";
    const params: any[] = [];

    if (courseId) {
      where += " AND sg.courseId = ?";
      params.push(courseId);
    }

    const [groups] = await mysqlPool.query(
      `SELECT sg.*,
              sp.name AS creatorName,
              c.title AS courseTitle,
              COUNT(sgm.id) AS memberCount
       FROM StudyGroups sg
       LEFT JOIN StudentProfiles sp ON sp.userId = sg.createdBy
       LEFT JOIN Courses c ON sg.courseId = c.id
       LEFT JOIN StudyGroupMembers sgm ON sg.id = sgm.groupId
       ${where}
       GROUP BY sg.id
       ORDER BY sg.createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countResult] = await mysqlPool.query(
      `SELECT COUNT(*) AS total FROM StudyGroups sg ${where}`,
      params
    );

    return NextResponse.json({
      groups,
      pagination: { page, limit, total: (countResult as any)[0].total },
    });
  } catch (error) {
    console.error("Study groups GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
