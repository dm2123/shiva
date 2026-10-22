/**
 * Mojibake repair — kuch purani rows (seed/import ke samay) me em-dash aur
 * curly quotes double-encoded stored ho gaye the: asal "—" ki jagah
 * "â€"" (U+00E2 U+20AC U+201D) jaise akshar. API wahi stored text deta tha,
 * isliye app me title/description ajeeb dikhte the.
 *
 * fixMojibakeText(): sirf jaane-maane kharab sequences ko sahi akshar se
 * badalta hai — saaf text ko haath nahi lagata.
 *
 * ensureMojibakeRepair(): server par ek baar (per process) chalta hai,
 * Lectures/Courses/Chapters/Subjects/Tests ke title/description/name
 * scan karke kharab rows ko DB me hi UPDATE kar deta hai — taaki stored
 * data source par theek ho jaye. Kabhi throw nahi karta.
 */
import { mysqlPool } from './db';

const FIXES: Array<[string, string]> = [
  ['\u00E2\u20AC\u201D', '\u2014'], // â€" -> —
  ['\u00E2\u20AC\u201C', '\u2013'], // â€" -> –
  ['\u00E2\u20AC\u2122', '\u2019'], // â€™ -> '
  ['\u00E2\u20AC\u02DC', '\u2018'], // â€˜ -> '
  ['\u00E2\u20AC\u0153', '\u201C'], // â€œ -> "
  ['\u00E2\u20AC\uFFFD', '\u201D'], // â€� -> "
  ['\u00E2\u20AC\u00A2', '\u2022'], // â€¢ -> •
  ['\u00E2\u20AC\u00A6', '\u2026'], // â€¦ -> …
  ['\u00E2\u201A\u00B9', '\u20B9'], // â‚¹ -> ₹
];

const BAD_PATTERN = /[\u00E2][\u20AC\u201A]/;

export function fixMojibakeText(
  value: string | null | undefined,
): string | null | undefined {
  if (typeof value !== 'string' || !BAD_PATTERN.test(value)) return value;
  let out = value;
  for (const [bad, good] of FIXES) {
    if (out.includes(bad)) out = out.split(bad).join(good);
  }
  return out;
}

const TEXT_KEYS = new Set(['title', 'description', 'name', 'courseTitle', 'subject', 'chapter']);

/**
 * Response object ke andar title/description/name wale saare string
 * fields ko in-place saaf karta hai (nested arrays/objects samet).
 */
export function sanitizeTextDeep(node: any): any {
  if (Array.isArray(node)) {
    for (const item of node) sanitizeTextDeep(item);
    return node;
  }
  if (node && typeof node === 'object') {
    for (const [key, val] of Object.entries(node)) {
      if (typeof val === 'string' && TEXT_KEYS.has(key)) {
        node[key] = fixMojibakeText(val);
      } else if (val && typeof val === 'object') {
        sanitizeTextDeep(val);
      }
    }
  }
  return node;
}

const TABLES: Array<{ table: string; fields: string[] }> = [
  { table: 'Lectures', fields: ['title', 'description'] },
  { table: 'Courses', fields: ['title', 'description'] },
  { table: 'Chapters', fields: ['title', 'description'] },
  { table: 'Subjects', fields: ['name', 'description'] },
  { table: 'Tests', fields: ['title', 'description'] },
];

let repairPromise: Promise<void> | null = null;

export function ensureMojibakeRepair(): Promise<void> {
  if (!repairPromise) {
    repairPromise = (async () => {
      try {
        for (const { table, fields } of TABLES) {
          let rows: any[] = [];
          try {
            const [result]: any = await mysqlPool.query(
              `SELECT id, ${fields.join(', ')} FROM ${table}`
            );
            rows = result || [];
          } catch {
            continue; // table/column na ho to chup-chaap aage badho
          }
          for (const row of rows) {
            for (const field of fields) {
              const before = row[field];
              const after = fixMojibakeText(before);
              if (typeof before === 'string' && after !== before) {
                try {
                  await mysqlPool.query(`UPDATE ${table} SET ${field} = ? WHERE id = ?`, [
                    after,
                    row.id,
                  ]);
                } catch {
                  /* ek row fail ho to baaki repair rukna nahi chahiye */
                }
              }
            }
          }
        }
      } catch {
        /* repair kabhi request ko fail nahi karega */
      }
    })();
  }
  return repairPromise;
}
