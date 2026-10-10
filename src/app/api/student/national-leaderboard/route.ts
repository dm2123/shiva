import { NextRequest, NextResponse } from "next/server";
import { mysqlPool } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { UserRole } from "@/types/auth";

export async function GET(req: NextRequest) {
  const session = await requireRole(req, UserRole.STUDENT);

  try {
    const { searchParams } = new URL(req.url);
    const exam = searchParams.get("exam") || "JEE";
    const state = searchParams.get("state");
    const city = searchParams.get("city");

    let where = "WHERE nl.exam = ?";
    const params: any[] = [exam];

    const [leaderboard] = await mysqlPool.query(
      `SELECT nl.*
       FROM NationalLeaderboard nl
       ${where}
       ORDER BY nl.totalScore DESC
       LIMIT 100`,
      params
    );

    const [userEntry] = await mysqlPool.query(
      `SELECT nl.*,
              (SELECT COUNT(*) + 1 FROM NationalLeaderboard nl2
               WHERE nl2.exam = ? AND nl2.totalScore > nl.totalScore) AS userRank
       FROM NationalLeaderboard nl
       WHERE nl.studentId = ? AND nl.exam = ?`,
      [exam, session.userId, exam]
    );

    return NextResponse.json({
      leaderboard,
      userRank: (userEntry as any[])[0] || null,
      exam,
    });
  } catch (error) {
    console.error("National leaderboard GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireRole(req, UserRole.STUDENT);

  try {
    const { exam, score, state, city } = await req.json();

    if (!exam || score === undefined) {
      return NextResponse.json(
        { error: "exam and score are required" },
        { status: 400 }
      );
    }

    const [existing] = await mysqlPool.query(
      `SELECT id, totalScore FROM NationalLeaderboard
       WHERE studentId = ? AND exam = ?`,
      [session.userId, exam]
    );

    if ((existing as any[]).length) {
      const oldScore = (existing as any[])[0].totalScore;
      if (score > oldScore) {
        await mysqlPool.query(
          `UPDATE NationalLeaderboard SET totalScore = ?, updatedAt = NOW()
           WHERE studentId = ? AND exam = ?`,
          [score, session.userId, exam]
        );
      }
      return NextResponse.json({ message: "Score updated" });
    }

    await mysqlPool.query(
      `INSERT INTO NationalLeaderboard (id, studentId, exam, totalScore, testsTaken, avgScore)
       VALUES (?, ?, ?, ?, 1, ?)`,
      [`nl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, session.userId, exam, score, score]
    );

    return NextResponse.json({ message: "Score recorded" }, { status: 201 });
  } catch (error) {
    console.error("National leaderboard POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
