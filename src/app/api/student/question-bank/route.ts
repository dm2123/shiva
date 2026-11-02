import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { ensureQuestionBankSchema } from '@/lib/ensure-question-bank-schema';

/* ------------------------------------------------------------------ */
/* Mojibake repair — ROOT CAUSE note:                                  */
/* seed_db.sql ka source bilkul saaf UTF-8 hai ('15 + 36 ÷ 6 × 3      */
/* − 12'), lekin kuch provisioned DBs par rows double-encoded hain —  */
/* seed latin1/cp1252 connection se load hua tha, isliye UTF-8 bytes   */
/* 'Ã·' 'Ã—' 'âˆ’' bankar store ho gaye (÷ × − ki jagah). Ye helper    */
/* sirf unhi strings ko repair karta hai jinme mojibake ke nishan     */
/* hon: string ko cp1252 bytes me wapas badlo, phir UTF-8 decode      */
/* karo; result me U+FFFD aaye ya string pehle se saaf ho (Devanagari */
/* / asal symbols) to original hi rakho. Permanent fix stored rows    */
/* ka data-side reload hai (utf8mb4 connection se) — ye read-layer    */
/* repair tab tak web + app dono ko saaf text deta hai.                */
/* ------------------------------------------------------------------ */
const CP1252_SPECIALS: Record<number, number> = {
  0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A,
  0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92,
  0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C,
  0x017E: 0x9E, 0x0178: 0x9F,
};

function repairMojibake(input: any): any {
  if (typeof input !== 'string' || !input) return input;
  // Nishan hi na hon to haath mat lagao (saaf UTF-8 / Hindi surakshit)
  if (!/Ã|â|Â/.test(input)) return input;
  const bytes: number[] = [];
  for (const ch of input) {
    const code = ch.codePointAt(0) || 0;
    if (code <= 0xFF) bytes.push(code);
    else if (CP1252_SPECIALS[code] !== undefined) bytes.push(CP1252_SPECIALS[code]);
    else return input; // asal non-Latin char maujood — repair surakshit nahi
  }
  const repaired = Buffer.from(bytes).toString('utf8');
  if (repaired.includes('�') || repaired === input) return input;
  return repaired;
}

/* Options ka canonical roop — practice page (PracticePlayer) wala hi
   normalize: DB me options teen roopon me milte hain —
   { options: [{id, text}] } (seed), [{id, text}] (admin), ya string
   array (purane rows). Page pehle `q.options.length` dekhta tha —
   wrapper object par length undefined, isliye options kabhi render
   hi nahi hue. Ab API ek saaf `optionsList: [{id, text}]` deta hai;
   purana `options` field backward-compat ke liye jaisa tha waisa hi. */
function normalizeQbOptions(raw: any): { id: string; text: string }[] {
  if (!raw) return [];
  let parsed = raw;
  if (typeof raw === 'string') {
    try { parsed = JSON.parse(raw); } catch { return []; }
  }
  const arr = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.options) ? parsed.options : null);
  if (!arr) return [];
  return arr
    .map((o: any, i: number) => {
      if (typeof o === 'string') return { id: String.fromCharCode(97 + i), text: repairMojibake(o) };
      if (o && typeof o === 'object') {
        const text = o.text ?? o.label ?? o.value ?? '';
        return { id: String(o.id ?? String.fromCharCode(97 + i)), text: repairMojibake(String(text)) };
      }
      return null;
    })
    .filter((o: any) => o && o.text !== '');
}

// GET - Enhanced question bank with filters
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    // Self-heal: purane DBs par Questions/QuestionTags/QuestionDifficulty
    // missing ho to bana lo, warna Question Bank tab + DPP section 500 dega.
    // Note: canonical columns title/type hain (lib/db.ts writer) — pehle
    // route questionText/questionType filter karta tha, jo unknown-column
    // 500 deta tha; neeche filters + response alias canonical par hain.
    await ensureQuestionBankSchema();
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const chapterId = searchParams.get('chapterId');
    const difficulty = searchParams.get('difficulty');
    const type = searchParams.get('type');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params: any[] = [];

    if (subjectId) { where += ' AND q.subjectId = ?'; params.push(subjectId); }
    if (chapterId) { where += ' AND q.chapterId = ?'; params.push(chapterId); }
    if (type) { where += ' AND q.type = ?'; params.push(type); }
    if (difficulty) {
      // QuestionDifficulty row har sawal ke liye nahi hoti (seed sirf
      // Questions.difficulty bharta hai) — COALESCE se dono jagah dekho,
      // warna EASY filter par seeded sawal kabhi match hi nahi honge.
      where += ' AND COALESCE(qd.difficulty, q.difficulty) = ?';
      params.push(difficulty);
    }
    if (tag) {
      where += ' AND EXISTS (SELECT 1 FROM QuestionTags qt WHERE qt.questionId = q.id AND qt.tag = ?)';
      params.push(tag);
    }
    if (search) {
      where += ' AND q.title LIKE ?';
      params.push(`%${search}%`);
    }

    const [countResult]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS total FROM Questions q
       LEFT JOIN QuestionDifficulty qd ON q.id = qd.questionId
       ${where}`, params
    );
    const total = countResult[0]?.total || 0;

    const [questions]: any = await mysqlPool.query(
      `SELECT q.*, qd.difficulty AS qdDifficulty, qd.estimatedTimeSeconds, qd.correctRate, qd.avgTimeSeconds, qd.totalAttempts,
        c.title AS chapterTitle, s.name AS subjectName,
        (SELECT GROUP_CONCAT(qt.tag) FROM QuestionTags qt WHERE qt.questionId = q.id) AS tags
       FROM Questions q
       LEFT JOIN QuestionDifficulty qd ON q.id = qd.questionId
       LEFT JOIN Chapters c ON q.chapterId = c.id
       LEFT JOIN Subjects s ON q.subjectId = s.id
       ${where}
       ORDER BY FIELD(COALESCE(qd.difficulty, q.difficulty), 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD'), q.id
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Get available tags
    const [tags]: any = await mysqlPool.query(
      'SELECT DISTINCT tag, COUNT(*) AS count FROM QuestionTags GROUP BY tag ORDER BY count DESC LIMIT 50'
    );

    // Get difficulty distribution — COALESCE wahi fallback jo upar hai.
    // NULL group yahan jaan-bujh kar nahi aata: bina difficulty wale
    // sawal kisi bucket ke nahi hote; pehle NULL group page par ek
    // orphan '· 10' pill bankar dikhta tha.
    const [diffDistRaw]: any = await mysqlPool.query(
      `SELECT COALESCE(qd.difficulty, q.difficulty) AS difficulty, COUNT(*) AS count
       FROM Questions q LEFT JOIN QuestionDifficulty qd ON q.id = qd.questionId
       GROUP BY COALESCE(qd.difficulty, q.difficulty)`
    );
    const diffDist = (diffDistRaw || []).filter((d: any) => d.difficulty);

    // Subject / chapter filter options — SIRF wahi subjects/chapters
    // jinke paas asal questions hain (dropdown me khaali options kabhi
    // nahi). Pehle ye lists response me thi hi nahi, isliye page par
    // subject/chapter dropdown banana hi mumkin nahi tha, chahe API
    // subjectId/chapterId params accept karta tha.
    const [subjectOptions]: any = await mysqlPool.query(
      `SELECT s.id, s.name, COUNT(q.id) AS questionCount
       FROM Questions q
       JOIN Subjects s ON s.id = q.subjectId
       WHERE q.subjectId IS NOT NULL
       GROUP BY s.id, s.name
       ORDER BY s.name`
    );

    const [chapterOptions]: any = await mysqlPool.query(
      `SELECT c.id, c.title, c.subjectId, COUNT(q.id) AS questionCount
       FROM Questions q
       JOIN Chapters c ON c.id = q.chapterId
       WHERE q.chapterId IS NOT NULL
       GROUP BY c.id, c.title, c.subjectId
       ORDER BY c.title`
    );

    return NextResponse.json({
      success: true,
      data: {
        questions: questions.map((q: any) => ({
          ...q,
          // Web + app dono questionText/questionType dekhte hain; canonical
          // columns title/type hain — alias do, taaki text kabhi khaali na aaye.
          // Legacy row (dono column maujood) par title/type hi jeetega.
          // Text fields par mojibake repair (upar root-cause note dekho).
          questionText: repairMojibake(q.title ?? q.questionText ?? null),
          questionType: q.type ?? q.questionType ?? null,
          explanation: repairMojibake(q.explanation ?? null),
          subjectName: repairMojibake(q.subjectName ?? null),
          chapterTitle: repairMojibake(q.chapterTitle ?? null),
          // Difficulty: QuestionDifficulty row na ho to Questions.difficulty
          // hi asal hai — pehle qd ka NULL jeet jata tha aur page har row
          // par 'N/A' pill dikhata tha. Dono na hon to null (page pill
          // chhupa dega, 'N/A' kabhi print nahi hoga).
          difficulty: q.qdDifficulty ?? q.difficulty ?? null,
          qdDifficulty: undefined,
          options: (() => {
            if (typeof q.options !== 'string') return q.options;
            try { return JSON.parse(q.options); } catch { return q.options; }
          })(),
          // Saaf roop jo page asal me render karta hai: [{id, text}]
          optionsList: normalizeQbOptions(q.options),
          tags: q.tags ? q.tags.split(',') : [],
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        filters: { tags, difficultyDistribution: diffDist, subjects: subjectOptions, chapters: chapterOptions }
      }
    });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
