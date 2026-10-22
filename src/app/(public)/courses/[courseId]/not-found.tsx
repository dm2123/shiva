import Link from 'next/link';

export default function CourseNotFound() {
  return (
    <div className="shiva-landing">
      <section style={{ paddingTop: 56, paddingBottom: 80 }}>
        <div className="wrap">
          <div
            className="batch"
            style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '48px 32px' }}
          >
            <div style={{ fontSize: 56, marginBottom: 14 }} aria-hidden>
              🔍
            </div>
            <span
              style={{
                display: 'inline-block',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                background: '#ede9fe',
                color: '#6d28d9',
                padding: '5px 12px',
                borderRadius: 999,
                marginBottom: 14,
              }}
            >
              Course nahi mila
            </span>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#2a1650', marginBottom: 10, lineHeight: 1.3 }}>
              Ye course uplabdh nahi hai
            </h1>
            <p style={{ fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 24 }}>
              Ho sakta hai course abhi publish na hua ho, ya link purana ho gaya ho. Ghabrao mat —
              saare published courses catalog me dekho, ya home page se dobara shuru karo.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/courses" className="btn btn-primary" style={{ padding: '13px 24px' }}>
                Saare Courses Dekho →
              </Link>
              <Link
                href="/"
                className="btn"
                style={{
                  padding: '13px 24px',
                  border: '2px solid var(--line)',
                  color: '#2a1650',
                  background: '#fff',
                }}
              >
                Home Page
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
