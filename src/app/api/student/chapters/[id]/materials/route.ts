import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { ensureLectureMaterialsSchema, materialCategory } from '@/lib/ensure-lecture-materials-schema';

/**
 * GET /api/student/chapters/[id]/materials
 *
 * Ek chapter ke saare published lecture materials — do raaston se:
 * (a) material.chapterId = chapter (naye writer rows), aur
 * (b) material.lectureId us chapter ke kisi lecture ka hai (purani
 * rows jinka chapterId NULL hai). Har row ke saath lectureTitle bhi
 * aata hai taaki UI material ko uske lecture ke neeche dikha sake.
 * Response lecture-wise group karke bhi milta hai (byLecture) taaki
 * Notes/DPP area seedha render ho jaye.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.STUDENT);
    await ensureLectureMaterialsSchema();

    let rows: any;
    try {
      [rows] = await mysqlPool.query(
        `SELECT lm.*, l.title AS lectureTitle, l.sortOrder AS lectureSortOrder
           FROM LectureMaterials lm
           JOIN Lectures l ON l.id = lm.lectureId
          WHERE (lm.chapterId = ? OR l.chapterId = ?)
            AND lm.isPublished = 1
          ORDER BY l.sortOrder ASC, lm.sortOrder ASC, lm.createdAt DESC`,
        [params.id, params.id]
      );
    } catch (e: any) {
      if (e?.code !== 'ER_BAD_FIELD_ERROR' && !String(e?.message || '').includes('isPublished')) throw e;
      [rows] = await mysqlPool.query(
        `SELECT lm.*, l.title AS lectureTitle, l.sortOrder AS lectureSortOrder
           FROM LectureMaterials lm
           JOIN Lectures l ON l.id = lm.lectureId
          WHERE (lm.chapterId = ? OR l.chapterId = ?)
          ORDER BY l.sortOrder ASC, lm.createdAt DESC`,
        [params.id, params.id]
      );
    }

    const materials = (rows || []).map((m: any) => ({ ...m, category: materialCategory(m.fileType) }));

    const byLecture: Record<string, { lectureId: string; lectureTitle: string; materials: any[] }> = {};
    for (const m of materials) {
      if (!byLecture[m.lectureId]) {
        byLecture[m.lectureId] = { lectureId: m.lectureId, lectureTitle: m.lectureTitle, materials: [] };
      }
      byLecture[m.lectureId].materials.push(m);
    }

    return NextResponse.json({
      success: true,
      data: { materials, byLecture: Object.values(byLecture) },
    });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
