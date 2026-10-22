import Reveal from './Reveal';

export default function ShivaTestimonials() {
  return (
    <section style={{ background: '#fff' }}>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="kicker">Success Stories</span>
          <h2>
            Asli Kahaniyan, <span className="hl">Jab Asli Results Aayenge</span>
          </h2>
          <p>Hum nakli testimonials nahi dikhate. Pehle students ke asli results yahin, unke naam ke saath aayenge.</p>
        </Reveal>
        <div className="grid3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
          <Reveal>
            <div className="testi" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🌟</div>
              <p style={{ fontStyle: 'italic' }}>
                &ldquo;Pehle batch ke students ki success stories yahan dikhengi. Tumhari kahani agli ho
                sakti hai!&rdquo;
              </p>
              <b>Agli Kahani — Tumhari</b>
              <br />
              <span>Taiyaari aaj se shuru karo</span>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div
              className="testi"
              style={{
                textAlign: 'center',
                background: 'linear-gradient(135deg,#ede9fe,#ddd6fe)',
                border: 'none',
              }}
            >
              <div style={{ fontSize: 52, marginBottom: 12 }}>🚀</div>
              <p style={{ fontStyle: 'normal', fontWeight: 600 }}>
                Join our first batch — free Aptitude course se shuru karo aur apni success story likho.
              </p>
              <a
                className="btn btn-primary"
                href="/courses/aptitude-foundation-free"
                style={{ display: 'inline-block', marginTop: 8 }}
              >
                Start Your Journey →
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
