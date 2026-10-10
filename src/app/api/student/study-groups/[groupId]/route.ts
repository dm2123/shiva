import { NextRequest, NextResponse } from "next/server";
import { mysqlPool } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { UserRole } from "@/types/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const session = await requireRole(req, UserRole.STUDENT);

  try {
    const groupId = params.groupId;

    const [groups] = await mysqlPool.query(
      `SELECT sg.*,
              sp.name AS creatorName,
              c.title AS courseTitle
       FROM StudyGroups sg
       LEFT JOIN StudentProfiles sp ON sg.createdBy = sp.userId
       LEFT JOIN Courses c ON sg.courseId = c.id
       WHERE sg.id = ?`,
      [groupId]
    );

    if (!(groups as any[]).length) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const [members] = await mysqlPool.query(
      `SELECT sgm.*, sp.name, sp.email
       FROM StudyGroupMembers sgm
       LEFT JOIN StudentProfiles sp ON sgm.studentId = sp.userId
       WHERE sgm.groupId = ?
       ORDER BY sgm.role DESC, sgm.joinedAt ASC`,
      [groupId]
    );

    const [messages] = await mysqlPool.query(
      `SELECT sgm.*, sp.name AS userName
       FROM StudyGroupMessages sgm
       LEFT JOIN StudentProfiles sp ON sgm.senderId = sp.userId
       WHERE sgm.groupId = ?
       ORDER BY sgm.createdAt DESC
       LIMIT 50`,
      [groupId]
    );

    return NextResponse.json({
      group: (groups as any[])[0],
      members,
      messages: (messages as any[]).reverse(),
    });
  } catch (error) {
    console.error("Study group details GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const session = await requireRole(req, UserRole.STUDENT);

  try {
    const groupId = params.groupId;
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const [membership] = await mysqlPool.query(
      `SELECT id FROM StudyGroupMembers WHERE groupId = ? AND studentId = ?`,
      [groupId, session.userId]
    );

    if (!(membership as any[]).length) {
      return NextResponse.json({ error: "You are not a member of this group" }, { status: 403 });
    }

    const msgId = `sgm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await mysqlPool.query(
      `INSERT INTO StudyGroupMessages (id, groupId, senderId, content)
       VALUES (?, ?, ?, ?)`,
      [msgId, groupId, session.userId, content]
    );

    return NextResponse.json(
      { message: "Message sent", messageId: msgId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Study group message POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
