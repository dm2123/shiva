'use client';

import Reveal from './Reveal';

/** Dispatch this event anywhere to open the callback modal */
export function openCallbackModal() {
  window.dispatchEvent(new CustomEvent('shiva:open-callback'));
}

export default function ShivaScholarship() {
  return (
    <section id="scholarship" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <Reveal>
          <div className="scholar">
            <div>
              <h2>🎓 SHIVA Scholarship Test — 100% Tak Chhoot!</h2>
              <p>Har mahine scholarship test. Top rankers ko poori fees me chhoot.</p>
            </div>
            <a className="btn" style={{ background: '#1e1b2e', color: '#fff' }} href="/register">
              Register Free →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
