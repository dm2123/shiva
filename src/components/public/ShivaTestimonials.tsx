import Reveal from './Reveal';

export default function ShivaTestimonials() {
  return (
    <section style={{ background: '#fff' }}>
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="kicker">Testimonials</span>
          <h2>Students Kya Kehte Hain</h2>
        </Reveal>
        <div className="grid3">
          <Reveal>
            <div className="testi" style={{ gridColumn: '1/-1', textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
              <div className="stars" style={{ fontSize: 34 }}>
                🏆
              </div>
              <p style={{ fontStyle: 'normal', fontSize: 16.5 }}>
                &ldquo;Hamara pehla batch jald launch ho raha hai — yahan hamare students ki asli reviews
                aayengi. Tab tak free demo class lo aur khud faisla karo.&rdquo;
              </p>
              <a className="btn btn-primary" href="#demoCard" style={{ display: 'inline-block', marginTop: 8 }}>
                Book Free Demo →
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
