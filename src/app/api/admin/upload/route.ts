import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const uploadPath = path.join(process.cwd(), 'public/uploads', filename);

    await writeFile(uploadPath, buffer);

    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
