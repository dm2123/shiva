/**
 * THE SHIVA — Exam category derivation (shared, server-safe)
 * ----------------------------------------------------------
 * Course ke apne title + slug ke keywords se exam category
 * derive hoti hai. Ye function PEHLE components/public/
 * CourseCard.tsx me tha — jo ek 'use client' module hai.
 * Server component (jaise /test-series page) jab client
 * module se plain function import karke server par call
 * karta hai, to production server build me woh binding
 * undefined ho jati hai — "is not a function" par page ka
 * render crash (HTTP 500) asal data ke saath, jabki khaali
 * data par function kabhi call hi nahi hota tha isliye
 * galti chhup jati thi. Isiliye ye function ab is pure
 * (non-client) module me hai — server aur client dono
 * yahin se import karein.
 *
 * Null-safety: title/slug null/undefined/non-string hon to
 * bhi crash nahi — khaali string maan kar aage badhta hai.
 */

export interface ExamCategory {
  id: string;
  label: string;
  icon: string;
}

const CATEGORY_RULES: { id: string; label: string; icon: string; pattern: RegExp }[] = [
  { id: 'ssc', label: 'SSC', icon: '🎯', pattern: /\bssc\b|cgl|chsl|\bmts\b|steno/i },
  { id: 'railway', label: 'Railway', icon: '🚂', pattern: /railway|ntpc|\brrb\b|group[\s-]?d/i },
  { id: 'banking', label: 'Banking', icon: '🏦', pattern: /bank|ibps|\bsbi\b|banking/i },
  { id: 'defence', label: 'Defence', icon: '🛡️', pattern: /defence|defense|\bnda\b|\bcds\b|afcat|agniveer|army|navy|air[\s-]?force/i },
  { id: 'teaching', label: 'Teaching', icon: '👩‍🏫', pattern: /ctet|uptet|\btet\b|teacher|teaching|\bkvs\b|dsssb|b\.?ed/i },
  { id: 'upsc', label: 'UPSC', icon: '🏛️', pattern: /upsc|\bias\b|civil[\s-]?service/i },
  { id: 'state', label: 'State Exams', icon: '🗺️', pattern: /upsssc|uppsc|bpsc|\bpsc\b|\bpet\b|state[\s-]?exam/i },
  { id: 'foundation', label: 'Foundation', icon: '📚', pattern: /foundation|aptitude|crash/i },
];

/** Returns the exam category honestly derivable from title/slug, else null. */
export function deriveExamCategory(
  course: { title?: unknown; slug?: unknown } | null | undefined,
): ExamCategory | null {
  if (!course) return null;
  const title = typeof course.title === 'string' ? course.title : '';
  const slug = typeof course.slug === 'string' ? course.slug : '';
  const haystack = `${title} ${slug.replace(/-/g, ' ')}`;
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(haystack)) {
      return { id: rule.id, label: rule.label, icon: rule.icon };
    }
  }
  return null;
}
