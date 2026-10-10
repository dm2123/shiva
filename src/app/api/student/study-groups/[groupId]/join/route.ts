import { NextRequest, NextResponse } from "next/server";
import { mysqlPool } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { UserRole } from "@/types/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const session = await requireRole(req, UserRole.STUDENT);

  try {
    const groupId = params.groupId;

    const [groups] = await mysqlPool.query(
      `SELECT * FROM StudyGroups WHERE id = ?`,
      [groupId]
    );

    if (!(groups as any[]).length) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const group = (groups as any[])[0];

    const [existing] = await mysqlPool.query(
      `SELECT id FROM StudyGroupMembers WHERE groupId = ? AND studentId = ?`,
      [groupId, session.userId]
    );

    if ((existing as any[]).length) {
      return NextResponse.json({ error: "Already a member" }, { status: 409 });
    }

    const [memberCount] = await mysqlPool.query(
      `SELECT COUNT(*) AS cnt FROM StudyGroupMembers WHERE groupId = ?`,
      [groupId]
    );

    if ((memberCount as any)[0].cnt >= group.maxMembers) {
      return NextResponse.json({ error: "Group is full" }, { status: 400 });
    }

    const memberId = `sgm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await mysqlPool.query(
      `INSERT INTO StudyGroupMembers (id, groupId, studentId, role)
       VALUES (?, ?, ?, 'MEMBER')`,
      [memberId, groupId, session.userId]
    );

    return NextResponse.json({ message: "Joined study group successfully" });
  } catch (error) {
    console.error("Join group POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
