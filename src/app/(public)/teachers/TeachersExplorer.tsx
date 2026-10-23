'use client';

/**
 * THE SHIVA — Teachers Explorer (public listing ka interactive hissa)
 * ------------------------------------------------------------------
 * Search + subject-wise filter SIRF asal teacher data ke fields par:
 * naam, subjects, specialties, qualification, tagline. Koi field data
 * me na ho to us par filter chip banta hi nahi.
 *
 * Card pattern (design language): safed rounded-2xl card, halki
 * shadow, upar purple-gradient photo band (asal photo ya original
 * initials-avatar), bold naam, subject, GREY 'X Years Exp' pill
 * (sirf asal experienceYears > 0 par), neeche detail arrow.
 * Koi fake rating / student-count / experience invent NAHI hota.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';

export interface TeacherCardData {
  key: string;
  name: string;
  slug?: string;
  photo?: string;
  subjects: string[];
  specialties: string[];
  exp: number;
  qualification?: string;
  tagline?: string;
  about?: string;
  verified?: boolean;
}

function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('') || 'S'
  );
}

/* ------------------------------------------------------------------ */
/* Teacher card — PW-pattern (photo band → naam/subject → grey pill)   */
/* ------------------------------------------------------------------ */

function TeacherCard({ teacher }: { teacher: TeacherCardData }) {
  const chips = [
    ...teacher.subjects,
    ...teacher.specialties.filter((s) => !teacher.subjects.includes(s)),
  ];
  const primarySubject = teacher.subjects[0] || teacher.specialties[0] || undefined;
  const subLine =
    teacher.tagline ||
    (teacher.qualification && teacher.qualification !== primarySubject
      ? teacher.qualification
      : undefined);

  const card = (
    <article
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        border: '2px solid #ede9fe',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 6px 24px rgba(42,22,80,.08)',
      }}
    >
      {/* Photo band — asal photo ho to wahi; na ho to purple gradient
          par original initials-avatar */}
      <div
        style={{
          background: 'linear-gradient(135deg,#2a1650 0%,#6d28d9 100%)',
          padding: '26px 16px 22px',
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {teacher.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={teacher.photo}
            alt={teacher.name}
            loading="lazy"
            style={{
              width: 92,
              height: 92,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid rgba(255,255,255,.65)',
              background: '#ede9fe',
            }}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{
              width: 92,
              height: 92,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 900,
              color: '#fff',
              background: 'rgba(255,255,255,.16)',
              border: '3px solid rgba(255,255,255,.45)',
            }}
          >
            {initialsOf(teacher.name)}
          </div>
        )}
        {teacher.verified ? (
          <span
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              background: '#ede9fe',
              color: '#6d28d9',
              padding: '4px 9px',
              borderRadius: 999,
            }}
          >
            ✓ Verified
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div
        style={{
          padding: '18px 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          flex: 1,
        }}
      >
        <h3 style={{ fontSize: 17.5, fontWeight: 800, color: '#2a1650', lineHeight: 1.3 }}>
          {teacher.name}
        </h3>

        {primarySubject && (
          <p style={{ fontSize: 13.5, fontWeight: 700, color: '#6d28d9', marginTop: 5 }}>
            {primarySubject}
            {teacher.subjects.length > 1 ? ` + ${teacher.subjects.length - 1} more subjects` : ''}
          </p>
        )}

        {subLine && (
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4, lineHeight: 1.5 }}>{subLine}</p>
        )}

        {/* Grey experience pill — SIRF asal experienceYears par */}
        {teacher.exp > 0 && (
          <span
            style={{
              display: 'inline-block',
              marginTop: 11,
              fontSize: 12,
              fontWeight: 700,
              color: '#4b5563',
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              padding: '5px 12px',
              borderRadius: 999,
            }}
          >
            🎓 {teacher.exp} {teacher.exp === 1 ? 'Year' : 'Years'} Exp
          </span>
        )}

        {teacher.about && (
          <p
            style={{
              fontSize: 13.5,
              color: '#6b7280',
              lineHeight: 1.6,
              marginTop: 12,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {teacher.about}
          </p>
        )}

        {chips.length > 1 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              justifyContent: 'center',
              marginTop: 13,
            }}
          >
            {chips.slice(0, 3).map((chip) => (
              <span
                key={chip}
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: '#6d28d9',
                  background: '#f5f3ff',
                  border: '1px solid #ede9fe',
                  padding: '4px 10px',
                  borderRadius: 999,
                }}
              >
                {chip}
              </span>
            ))}
            {chips.length > 3 && (
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: '#6b7280',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  padding: '4px 10px',
                  borderRadius: 999,
                }}
              >
                +{chips.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Detail arrow — profile ka rasta */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 9,
          }}
        >
          {teacher.slug ? (
            <>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#6d28d9' }}>View Profile</span>
              <span
                aria-hidden="true"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '2px solid #6d28d9',
                  color: '#6d28d9',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                →
              </span>
            </>
          ) : (
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#9ca3af' }}>
              Profile on THE SHIVA
            </span>
          )}
        </div>
      </div>
    </article>
  );

  return teacher.slug ? (
    <Link
      href={`/teachers/${teacher.slug}`}
      style={{ display: 'block', height: '100%' }}
      aria-label={`${teacher.name} — teacher profile`}
    >
      {card}
    </Link>
  ) : (
    card
  );
}

/* ------------------------------------------------------------------ */
/* Explorer — search + subject chips + grid                           */
/* ------------------------------------------------------------------ */

const chipBase: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 999,
  fontSize: 13.5,
  fontWeight: 700,
  cursor: 'pointer',
  border: '2px solid #ede9fe',
  background: '#fff',
  color: '#4c1d95',
  whiteSpace: 'nowrap',
  fontFamily: 'inherit',
};

const chipActive: React.CSSProperties = {
  ...chipBase,
  background: '#6d28d9',
  borderColor: '#6d28d9',
  color: '#fff',
  boxShadow: '0 8px 20px rgba(109,40,217,.28)',
};

export default function TeachersExplorer({ teachers }: { teachers: TeacherCardData[] }) {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState<string>('all');

  /* Subject chips SIRF un subjects ke liye jo asal teachers me hain */
  const subjects = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of teachers) {
      for (const s of t.subjects) map.set(s, (map.get(s) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [teachers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teachers.filter((t) => {
      if (subject !== 'all' && !t.subjects.includes(subject)) return false;
      if (q) {
        const text = [
          t.name,
          ...t.subjects,
          ...t.specialties,
          t.qualification || '',
          t.tagline || '',
        ]
          .join(' ')
          .toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [teachers, query, subject]);

  const hasActiveFilters = query.trim() !== '' || subject !== 'all';

  return (
    <div>
      {/* ── Search ─────────────────────────────────────────────── */}
      <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto 18px' }}>
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 16,
            opacity: 0.55,
          }}
        >
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Teacher ya subject khojo…"
          aria-label="Teacher ya subject search karo"
          style={{
            width: '100%',
            padding: '12px 40px 12px 42px',
            border: '2px solid #ede9fe',
            borderRadius: 12,
            fontSize: 14.5,
            color: '#1e1b2e',
            background: '#fff',
            fontFamily: 'inherit',
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Search saaf karo"
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: 'none',
              background: '#ede9fe',
              color: '#6d28d9',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* ── Subject chips (sirf asal subjects) ─────────────────── */}
      {subjects.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 22,
          }}
          role="group"
          aria-label="Subject se filter karo"
        >
          <button
            type="button"
            onClick={() => setSubject('all')}
            style={subject === 'all' ? chipActive : chipBase}
            aria-pressed={subject === 'all'}
          >
            All Teachers · {teachers.length}
          </button>
          {subjects.map(({ label, count }) => (
            <button
              key={label}
              type="button"
              onClick={() => setSubject(label)}
              style={subject === label ? chipActive : chipBase}
              aria-pressed={subject === label}
            >
              {label} · {count}
            </button>
          ))}
        </div>
      )}

      {/* ── Result count ── */}
      <p
        style={{
          fontSize: 13.5,
          color: '#6b7280',
          fontWeight: 600,
          marginBottom: 16,
          textAlign: 'center',
        }}
        aria-live="polite"
      >
        {filtered.length === teachers.length
          ? `Kul ${teachers.length} teacher${teachers.length === 1 ? '' : 's'}`
          : `${filtered.length} of ${teachers.length} teachers dikh rahe hain`}
        {subject !== 'all' ? ` · Subject: ${subject}` : ''}
      </p>

      {/* ── Grid / honest empty state ── */}
      {filtered.length === 0 ? (
        <div
          style={{
            maxWidth: 560,
            margin: '8px auto 0',
            textAlign: 'center',
            padding: 40,
            background: '#fff',
            border: '2px solid #ede9fe',
            borderRadius: 16,
            boxShadow: '0 6px 24px rgba(42,22,80,.08)',
          }}
          role="status"
        >
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.45 }} aria-hidden="true">
            🔍
          </div>
          <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 8, color: '#2a1650' }}>
            Is search me koi teacher nahi mila
          </h3>
          <p style={{ color: '#6b7280', fontSize: 14.5, marginBottom: 20, lineHeight: 1.65 }}>
            {query.trim()
              ? `“${query.trim()}” se match karta koi published teacher profile nahi mila. Spelling check karo ya filters saaf karke saare teachers dekho.`
              : 'Chune gaye subject me abhi koi teacher profile nahi hai. All Teachers par saare profiles dekho.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSubject('all');
            }}
            className="btn btn-primary"
            style={{ fontFamily: 'inherit' }}
          >
            Filters Saaf Karo — Saare Teachers Dekho
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 22 }}>
          {filtered.map((t) => (
            <TeacherCard key={t.key} teacher={t} />
          ))}
        </div>
      )}

      {hasActiveFilters && filtered.length > 0 && (
        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSubject('all');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#6d28d9',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Filters saaf karo ×
          </button>
        </p>
      )}
    </div>
  );
}
