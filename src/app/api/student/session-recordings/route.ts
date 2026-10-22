import { NextRequest, NextResponse } from "next/server";
import { mysqlPool } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { UserRole } from "@/types/auth";

export async function GET(req: NextRequest) {
  const session = await requireRole(req, UserRole.STUDENT);

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const [recordings] = await mysqlPool.query(
      `SELECT sr.*, lc.title AS liveClassTitle
       FROM SessionRecordings sr
       LEFT JOIN LiveClasses lc ON sr.liveClassId = lc.id
       ORDER BY sr.createdAt DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await mysqlPool.query(
      `SELECT COUNT(*) AS total
       FROM SessionRecordings sr`,
      []
    );

    return NextResponse.json({
      recordings,
      pagination: {
        page,
        limit,
        total: (countResult as any)[0].total,
      },
    });
  } catch (error) {
    if ((error as any).name === 'AuthError') return NextResponse.json({ error: (error as any).message }, { status: (error as any).statusCode || 401 });
    console.error("Session recordings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
