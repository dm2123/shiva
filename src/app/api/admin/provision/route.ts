import { NextRequest, NextResponse } from 'next/server';
import { provisionAdminAccount } from '@/services/user.service';

// Bootstrap admin account provisioning.
// Only works in development mode. Requires ADMIN_PROVISION_EMAIL and ADMIN_PROVISION_PASSWORD env vars.
export async function GET(req: NextRequest) {
  try {
    // Block in production
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Admin provisioning is disabled in production.' },
        { status: 403 }
      );
    }

    const email = process.env.ADMIN_PROVISION_EMAIL;
    const password = process.env.ADMIN_PROVISION_PASSWORD;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'ADMIN_PROVISION_EMAIL and ADMIN_PROVISION_PASSWORD env vars are required.' },
        { status: 400 }
      );
    }

    const name = process.env.ADMIN_PROVISION_NAME || 'Administrator';
    const department = 'Platform Management';

    await provisionAdminAccount(email, password, name, department);
    return NextResponse.json({ success: true, message: `Admin account provisioned for ${email}` });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    if (String(error.message).includes('Duplicate entry') || String(error.message).includes('ER_DUP_ENTRY')) {
      return NextResponse.json({ success: true, message: 'Admin account already exists.' });
    }
    return NextResponse.json({ success: false, error: error.message });
  }
}