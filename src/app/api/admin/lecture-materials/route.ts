import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { mysqlPool } from '@/lib/db';
import { ensureLectureMaterialsSchema, materialCategory } from '@/lib/ensure-lecture-materials-schema';
import { randomUUID } from 'crypto';
import { z } from 'zod';

/**
 * Admin lecture materials — content team yahan se per-lecture
 * notes/DPP/slides ke file links jod sakta hai. Teacher ke paas
 * /api/teacher/lectures/[id]/materials pehle se hai; ye admin wala
 * rasta CMS/admin panel ke liye hai (admin lectures route jaisa
 * session pattern: getSessionFromHeaders + role check).
 *
 * POST body: { lectureId, title, fileUrl, fileType?, isPublished?, sortOrder? }
 * fileType canonical set: PDF | NOTES | SLIDES | DPP | ANSWER_KEY
 * chapterId lecture se derive hota hai (client ko bhejna nahi padta).
 */

const FILE_TYPES = ['PDF', 'NOTES', 'SLIDES', 'DPP', 'ANSWER_KEY'] as const;

const createMaterialSchema = z.object({
  lectureId: z.string().trim().min(1, 'lectureId is required'),
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(255),
  fileUrl: z.string().trim().url('fileUrl must be a valid URL').max(2000),
  fileType: z.enum(FILE_TYPES).optional().default('NOTES'),
  isPublished: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).max(10000).optional().default(0),
});

async function requireAdmin() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'ADMIN') return null;
  return session;
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized. Admin access required.' } }, { status: 403 });
    }
    await ensureLectureMaterialsSchema();

    const lectureId = req.nextUrl.searchParams.get('lectureId');
    const chapterId = req.nextUrl.searchParams.get('chapterId');
    if (!lectureId && !chapterId) {
      return NextResponse.json({ success: false, error: { message: 'lectureId or chapterId query parameter is required' } }, { status: 400 });
    }

    const [rows]: any = lectureId
      ? await mysqlPool.query(
          'SELECT * FROM LectureMaterials WHERE lectureId = ? ORDER BY sortOrder ASC, createdAt DESC',
          [lectureId]
        )
      : await mysqlPool.query(
          `SELECT lm.* FROM LectureMaterials lm
             JOIN Lectures l ON l.id = lm.lectureId
            WHERE (lm.chapterId = ? OR l.chapterId = ?)
            ORDER BY l.sortOrder ASC, lm.sortOrder ASC, lm.createdAt DESC`,
          [chapterId, chapterId]
        );

    const materials = (rows || []).map((m: any) => ({ ...m, category: materialCategory(m.fileType) }));
    return NextResponse.json({ success: true, data: { materials } }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    console.error('Admin GET /api/admin/lecture-materials Error:', error);
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal server error' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized. Admin access required.' } }, { status: 403 });
    }
    await ensureLectureMaterialsSchema();

    const parsed = createMaterialSchema.safeParse(await req.json());
    if (!parsed.success) {
      const details = parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
      return NextResponse.json(
        { success: false, error: { message: 'Input validation failed.', details } },
        { status: 400 }
      );
    }
    const { lectureId, title, fileUrl, fileType, isPublished, sortOrder } = parsed.data;

    // Lecture asal me hona chahiye — usi se chapterId derive hota hai,
    // taaki chapter-level query me material hamesha dikhe.
    const [lectures]: any = await mysqlPool.query('SELECT id, chapterId FROM Lectures WHERE id = ? LIMIT 1', [lectureId]);
    if (!lectures || lectures.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Lecture not found' } }, { status: 404 });
    }
    const chapterId = lectures[0].chapterId || null;

    const id = randomUUID();
    await mysqlPool.query(
      `INSERT INTO LectureMaterials (id, lectureId, chapterId, title, fileUrl, fileType, isPublished, sortOrder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, lectureId, chapterId, title, fileUrl, fileType, isPublished ? 1 : 0, sortOrder]
    );

    const [created]: any = await mysqlPool.query('SELECT * FROM LectureMaterials WHERE id = ? LIMIT 1', [id]);
    const material = created?.[0] ? { ...created[0], category: materialCategory(created[0].fileType) } : { id, lectureId, chapterId, title, fileUrl, fileType };

    return NextResponse.json({ success: true, data: { material } }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    console.error('Admin POST /api/admin/lecture-materials Error:', error);
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal server error' } }, { status: 500 });
  }
}
