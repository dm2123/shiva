export default function CourseDetailLoading() {
  const bar = (w: string | number, h = 14, r = 8): React.CSSProperties => ({
    width: w,
    height: h,
    borderRadius: r,
    background: 'linear-gradient(90deg,#ede9fe 25%,#f5f3ff 50%,#ede9fe 75%)',
    backgroundSize: '200% 100%',
    animation: 'cdShimmer 1.4s ease-in-out infinite',
  });

  return (
    <div className="shiva-landing" aria-busy="true" aria-label="Course load ho raha hai">
      <section style={{ paddingTop: 32, paddingBottom: 72 }}>
        <div className="wrap">
          <div style={{ ...bar(220, 12), marginBottom: 18 }} />
          {/* Hero skeleton */}
          <div
            style={{
              background: 'linear-gradient(120deg,#2a1650,#4c1d95 55%,#6d28d9)',
              borderRadius: 22,
              padding: '34px 32px',
              marginBottom: 26,
            }}
          >
            <div style={{ ...bar(150, 22, 999), background: 'rgba(245,185,66,.35)', marginBottom: 16 }} />
            <div style={{ ...bar('62%', 30, 10), background: 'rgba(255,255,255,.28)', marginBottom: 12 }} />
            <div style={{ ...bar('88%', 14), background: 'rgba(255,255,255,.18)', marginBottom: 8 }} />
            <div style={{ ...bar('70%', 14), background: 'rgba(255,255,255,.18)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28 }} className="cd-load-grid">
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
                {[86, 78, 96, 92, 110, 118].map((w, i) => (
                  <div key={i} style={bar(w, 34, 10)} />
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      border: '2px solid var(--line)',
                      borderRadius: 16,
                      padding: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <div style={bar('45%', 16)} />
                    <div style={bar('92%', 12)} />
                    <div style={bar('78%', 12)} />
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                borderRadius: 20,
                background: '#fff',
                border: '1px solid var(--line)',
                boxShadow: '0 16px 40px rgba(42,22,80,.10)',
                padding: 24,
                height: 300,
              }}
            >
              <div style={{ ...bar('70%', 16), marginBottom: 12 }} />
              <div style={{ ...bar(90, 11), marginBottom: 12 }} />
              <div style={{ ...bar(130, 36, 10), marginBottom: 20 }} />
              <div style={{ ...bar('100%', 48, 12), background: '#111111', opacity: 0.85 }} />
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--muted)', marginTop: 28 }}>
            Course ki jankari load ho rahi hai…
          </p>
        </div>
      </section>
      <style>{`
        @keyframes cdShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @media (max-width: 900px) { .cd-load-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
