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
              <h2>🎓 SHIVA Scholarship Test — <span className="hl">Fee Me Chhoot Ka Mauka</span></h2>
              <p>
                Scholarship test me apni taiyaari dikhao — performance ke basis par selected courses par
                fee discount mil sakta hai. Test ki date aur shartein registration ke baad confirm hoti hain.
              </p>
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
