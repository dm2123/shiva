import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { removeDownload } from '@/lib/offline-downloads';

/**
 * DELETE /api/student/downloads/:id — DownloadButton / DownloadManager isi
 * path par DELETE bhejte hain. Sirf apni row mit sakti hai (id + userId);
 * doosre user ki row ya na-maujood id par ek hi 404 jawab.
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const removed = await removeDownload(session.userId, params.id);
    if (!removed) {
      return NextResponse.json({ success: false, error: 'Download not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error: any) {
    if (error?.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: 'Failed to delete download' }, { status: 500 });
  }
}
