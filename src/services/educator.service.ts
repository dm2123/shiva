import { EducatorProfile } from '@/types/educator';
import * as db from '@/lib/db';
import { ensureSeed } from '@/db/ensure-seed';

/**
 * Get all educators
 */
export async function listEducators(): Promise<EducatorProfile[]> {
  await ensureSeed();
  return await db.listAllEducators();
}

/**
 * Get active educators only
 */
export async function listActiveEducators(): Promise<EducatorProfile[]> {
  await ensureSeed();
  return await db.listActiveEducators();
}

/**
 * Get educator by ID
 */
export async function getEducatorById(id: string): Promise<EducatorProfile | null> {
  return await db.getEducatorById(id);
}

/**
 * Get educator by slug
 */
export async function getEducatorBySlug(slug: string): Promise<EducatorProfile | null> {
  return await db.getEducatorBySlug(slug);
}

/**
 * Search educators
 */
export async function searchEducators(query: string): Promise<EducatorProfile[]> {
  const educators = await db.listAllEducators();
  const q = query.toLowerCase();
  return educators.filter(
    (e) =>
      e.displayName.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q) ||
      e.specialties?.some((s: string) => s.toLowerCase().includes(q)) ||
      e.examCategories?.some((c: string) => c.toLowerCase().includes(q))
  );
}
