import { getPlatformStats } from '@/lib/db';
import { ensureSeed } from '@/db/ensure-seed';

/**
 * Get live platform statistics
 * Automatically updates as students enroll, teachers join, courses publish
 */
export async function getLivePlatformStats() {
  await ensureSeed();
  return await getPlatformStats();
}
