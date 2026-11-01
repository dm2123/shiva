import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { ensureLectureMaterialsSchema, materialCategory } from '@/lib/ensure-lecture-materials-schema';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.STUDENT);
    // Self-heal: purane DBs par LectureMaterials table missing ho sakti
    // hai (koi runtime ensure pehle tha hi nahi) — table/columns bana lo,
    // warna ye route hamesha 1146 par 500 deta tha.
    await ensureLectureMaterialsSchema();

    let rows: any;
    try {
      // Student ko sirf published material dikhta hai.
      [rows] = await mysqlPool.query(
        `SELECT * FROM LectureMaterials
          WHERE lectureId = ? AND isPublished = 1
          ORDER BY sortOrder ASC, createdAt DESC`,
        [params.id]
      );
    } catch (e: any) {
      // Defensive: ensure ke baad bhi isPublished column na ho (DDL
      // permission na mile aur table canonical purani ho) to purani
      // unfiltered query par gir jao — endpoint kabhi is wajah se
      // na mare jo pehle chal raha tha.
      if (e?.code !== 'ER_BAD_FIELD_ERROR' && !String(e?.message || '').includes('isPublished')) throw e;
      [rows] = await mysqlPool.query(
        'SELECT * FROM LectureMaterials WHERE lectureId = ? ORDER BY createdAt DESC',
        [params.id]
      );
    }

    const materials = (rows || []).map((m: any) => ({ ...m, category: materialCategory(m.fileType) }));
    return NextResponse.json({ success: true, data: { materials } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
