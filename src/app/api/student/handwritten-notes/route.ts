import { NextRequest, NextResponse } from "next/server";
import { mysqlPool } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { UserRole } from "@/types/auth";

export async function POST(req: NextRequest) {
  const session = await requireRole(req, UserRole.STUDENT);

  try {
    const { title, lectureId, subject, topic, fileUrl } = await req.json();

    if (!title || !subject || !topic || !fileUrl) {
      return NextResponse.json(
        { error: "title, subject, topic, and fileUrl are required" },
        { status: 400 }
      );
    }

    const id = `hn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await mysqlPool.query(
      `INSERT INTO HandwrittenNotes (id, studentId, title, lectureId, subject, topic, fileUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, session.userId, title, lectureId || null, subject, topic, fileUrl]
    );

    return NextResponse.json(
      { message: "Note uploaded successfully", id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Handwritten notes POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await requireRole(req, UserRole.STUDENT);

  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject");
    const topic = searchParams.get("topic");
    const lectureId = searchParams.get("lectureId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let where = "WHERE hn.studentId = ?";
    const params: any[] = [session.userId];

    if (subject) {
      where += " AND hn.subject = ?";
      params.push(subject);
    }
    if (topic) {
      where += " AND hn.topic LIKE ?";
      params.push(`%${topic}%`);
    }
    if (lectureId) {
      where += " AND hn.lectureId = ?";
      params.push(lectureId);
    }

    const [notes] = await mysqlPool.query(
      `SELECT hn.*,
              l.title AS lectureTitle,
              sp.name AS userName
       FROM HandwrittenNotes hn
       LEFT JOIN Lectures l ON hn.lectureId = l.id
       LEFT JOIN StudentProfiles sp ON hn.studentId = sp.userId
       ${where}
       ORDER BY hn.createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countResult] = await mysqlPool.query(
      `SELECT COUNT(*) AS total FROM HandwrittenNotes hn ${where}`,
      params
    );

    return NextResponse.json({
      notes,
      pagination: {
        page,
        limit,
        total: (countResult as any)[0].total,
      },
    });
  } catch (error) {
    console.error("Handwritten notes GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
