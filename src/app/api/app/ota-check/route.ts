import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * OTA update check for the React Native student app.
 *
 * GET /api/app/ota-check?platform=android&otaVersion=1&appVersion=1.0.0
 *
 * Reads public/ota/<platform>/manifest.json (no code change needed to ship
 * an OTA — just upload the new bundle + update the manifest, then push).
 *
 * manifest.json format:
 * {
 *   "latestVersion": 2,
 *   "url": "https://the-shiva.onrender.com/ota/android/2/index.android.bundle",
 *   "sha256": "<sha256 of the bundle>",
 *   "mandatory": false,
 *   "notes": "Naya dashboard design aa gaya!"
 * }
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const platform = (searchParams.get('platform') || 'android').toLowerCase();
  const otaVersion = parseInt(searchParams.get('otaVersion') || '0', 10);

  if (platform !== 'android') {
    return NextResponse.json({ updateAvailable: false });
  }

  try {
    const manifestPath = path.join(
      process.cwd(),
      'public',
      'ota',
      'android',
      'manifest.json',
    );
    const raw = await fs.readFile(manifestPath, 'utf-8');
    const m = JSON.parse(raw);

    const latestVersion = Number(m.latestVersion) || 0;
    if (!latestVersion || !m.url || latestVersion <= otaVersion) {
      return NextResponse.json({ updateAvailable: false, latestVersion });
    }

    return NextResponse.json({
      updateAvailable: true,
      latestVersion,
      url: m.url,
      sha256: m.sha256 || '',
      mandatory: !!m.mandatory,
      notes: m.notes || '',
    });
  } catch {
    // No manifest published yet -> no updates available.
    return NextResponse.json({ updateAvailable: false });
  }
}
