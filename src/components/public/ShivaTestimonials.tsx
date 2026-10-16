import Reveal from './Reveal';

export default function ShivaTestimonials() {
  return (
    <section style={{ background: '#fff' }}>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="kicker">Success Stories</span>
          <h2>
            Our Students, <span className="hl">Our Pride</span>
          </h2>
          <p>Real stories. Real journeys. Real dreams.</p>
        </Reveal>
        <div className="grid3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
          <Reveal>
            <div className="testi" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🌟</div>
              <p style={{ fontStyle: 'italic' }}>
                &ldquo;Pehle batch ke students ki success stories yahan dikhengi. Tumhari kahani agli ho
                sakti hai!&rdquo;
              </p>
              <b>Your Name Here</b>
              <br />
              <span>Future Achiever</span>
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
