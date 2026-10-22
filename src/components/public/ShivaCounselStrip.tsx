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
              {/* .btn-ghost is white-text (dark-bg variant in CSS) — this strip is a
                  white card, so the dark text/border is set explicitly. */}
              <button
                className="btn btn-ghost"
                style={{ color: '#4c1d95', borderColor: '#6d28d9' }}
                onClick={openCallbackModal}
              >
                📞 Request Callback
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
