'use client';

import Reveal from './Reveal';
import { openCallbackModal } from './ShivaScholarship';

export default function ShivaCounselStrip() {
  return (
    <section style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal>
          <div className="counsel-strip">
            <div>
              <h2>🤔 Abhi bhi confused ho?</h2>
              <p>Free counselling me apne exam ka poora roadmap pao — kaunsi batch, kya fees, kab se shuru.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a className="btn btn-accent" href="#demoCard">
                Book Free Demo →
              </a>
              <button className="btn btn-ghost" onClick={openCallbackModal}>
                📞 Request Callback
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
